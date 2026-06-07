import { NextRequest, NextResponse } from "next/server";
import { evaluateAnswerQuality } from "@/lib/answerQuality";
import { getAuthenticatedContext } from "@/lib/server/auth";
import {
  hashAnswer,
  verifyInterviewProof,
} from "@/lib/server/interviewProof";
import { checkRateLimit } from "@/lib/server/rateLimit";
import { generateInterviewSummary } from "@/lib/server/summary";
import type { DimensionScore, QuestionReview } from "@/lib/types";
import { createOptionalAdminClient } from "@/utils/supabase/admin";
import {
  COMPLETION_REASONS,
  getBoundedString,
  isAllowedValue,
  isPlainObject,
  isValidSetup,
  readJsonBody,
  REVIEW_STATUSES,
} from "@/lib/validation";

const TOTAL_QUESTIONS = 5;
const SESSION_COLUMNS =
  "id,composite_score,dimensions,question_scores,summary";
const zeroDimensions: DimensionScore[] = [
  "Communication",
  "Problem Solving",
  "Specificity",
  "Accuracy",
].map((label) => ({
  label,
  value: 0,
  reason: "No valid answer was submitted.",
}));

type ReviewInput = {
  question: string;
  prompt: string;
  answer?: string;
  status: QuestionReview["status"];
  evaluationToken?: string;
  detectionToken?: string;
  reason?: string;
};

const parseReviews = (value: unknown): ReviewInput[] | null => {
  if (!Array.isArray(value) || value.length > TOTAL_QUESTIONS) return null;

  const parsed: ReviewInput[] = [];
  const seenQuestions = new Set<string>();

  for (const item of value) {
    if (!isPlainObject(item)) return null;

    const question = getBoundedString(item.question, 2, 4);
    const prompt = getBoundedString(item.prompt, 8, 1200);
    const answer =
      typeof item.answer === "string"
        ? getBoundedString(item.answer, 1, 8000) ?? undefined
        : undefined;
    const evaluationToken =
      item.evaluationToken === undefined
        ? undefined
        : getBoundedString(item.evaluationToken, 20, 24_000);
    const detectionToken =
      item.detectionToken === undefined
        ? undefined
        : getBoundedString(item.detectionToken, 20, 24_000);
    const reason =
      item.reason === undefined
        ? undefined
        : getBoundedString(item.reason, 1, 1000);

    if (
      !question ||
      !/^Q[1-5]$/.test(question) ||
      seenQuestions.has(question) ||
      !prompt ||
      !isAllowedValue(item.status, REVIEW_STATUSES) ||
      (item.evaluationToken !== undefined && !evaluationToken) ||
      (item.detectionToken !== undefined && !detectionToken) ||
      (item.reason !== undefined && !reason)
    ) {
      return null;
    }

    if (item.status !== "autoSkipped" && !answer) return null;

    seenQuestions.add(question);
    parsed.push({
      question,
      prompt,
      answer,
      status: item.status,
      evaluationToken: evaluationToken ?? undefined,
      detectionToken: detectionToken ?? undefined,
      reason: reason ?? undefined,
    });
  }

  return parsed;
};

export async function POST(req: NextRequest) {
  const { user } = await getAuthenticatedContext();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createOptionalAdminClient();
  if (!admin) {
    return NextResponse.json(
      {
        error:
          "Secure interview storage is not configured. Add SUPABASE_SECRET_KEY to the server environment.",
      },
      { status: 503 }
    );
  }

  const rateLimit = checkRateLimit(
    `save-session:${user.id}`,
    12,
    30 * 60 * 1000
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many session submissions. Please wait and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const body = await readJsonBody(req, 140_000);
  if (!body.ok) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const input = body.data;
    if (
      !isPlainObject(input) ||
      !isValidSetup(input.setup) ||
      !isAllowedValue(input.completionReason, COMPLETION_REASONS)
    ) {
      return NextResponse.json(
        { error: "Invalid interview session." },
        { status: 400 }
      );
    }

    const submittedReviews = parseReviews(input.questionReviews);
    if (!submittedReviews) {
      return NextResponse.json(
        { error: "Invalid interview answers." },
        { status: 400 }
      );
    }

    const setup = input.setup;
    const questionSet = verifyInterviewProof(
      input.questionSetToken,
      "questionSet",
      user.id
    );
    if (
      !questionSet ||
      questionSet.kind !== "questionSet" ||
      questionSet.domain !== setup.domain ||
      questionSet.experience !== setup.experience ||
      questionSet.companyType !== setup.companyType ||
      questionSet.questions.length !== TOTAL_QUESTIONS
    ) {
      return NextResponse.json(
        { error: "The interview question set is invalid or expired." },
        { status: 400 }
      );
    }

    const { data: existingSession, error: existingSessionError } = await admin
      .from("interview_sessions")
      .select(SESSION_COLUMNS)
      .eq("user_id", user.id)
      .contains("summary", { sessionAttemptId: questionSet.sessionId })
      .maybeSingle();

    if (existingSessionError) {
      return NextResponse.json(
        { error: "The interview result could not be checked." },
        { status: 500 }
      );
    }

    if (existingSession) {
      return NextResponse.json({
        sessionId: existingSession.id,
        compositeScore: Number(existingSession.composite_score ?? 0),
        dimensions: existingSession.dimensions ?? [],
        questionScores: existingSession.question_scores ?? [],
        summary: existingSession.summary,
      });
    }

    const feedbackDimensions: DimensionScore[][] = [];
    const trustedReviews: QuestionReview[] = [];

    for (let index = 0; index < TOTAL_QUESTIONS; index += 1) {
      const questionLabel = `Q${index + 1}`;
      const submitted = submittedReviews.find(
        (review) => review.question === questionLabel
      );

      if (!submitted) {
        trustedReviews.push({
          question: questionLabel,
          prompt: questionSet.questions[index],
          score: 0,
          status: "autoSkipped",
          reason: "The session ended before this question was answered.",
        });
        continue;
      }

      if (submitted.prompt !== questionSet.questions[index]) {
        return NextResponse.json(
          { error: "The interview questions do not match this session." },
          { status: 400 }
        );
      }

      if (submitted.status === "autoSkipped") {
        trustedReviews.push({
          question: submitted.question,
          prompt: submitted.prompt,
          score: 0,
          status: "autoSkipped",
          reason: "The session ended before this question was answered.",
        });
        continue;
      }

      const answer = submitted.answer ?? "";
      const answerHash = hashAnswer(answer);

      if (
        submitted.status === "answered" &&
        (!submitted.evaluationToken || !submitted.detectionToken)
      ) {
        trustedReviews.push({
          question: submitted.question,
          prompt: submitted.prompt,
          answer,
          score: 0,
          status: "answered",
          reason: "The scoring service failed, so no credit was recorded.",
        });
        continue;
      }

      if (submitted.status === "gibberish") {
        const quality = evaluateAnswerQuality(answer, submitted.prompt);
        if (quality.valid) {
          return NextResponse.json(
            { error: "Invalid answer classification." },
            { status: 400 }
          );
        }

        trustedReviews.push({
          question: submitted.question,
          prompt: submitted.prompt,
          answer,
          score: 0,
          status: "gibberish",
          reason: quality.reason,
        });
        continue;
      }

      const detection = verifyInterviewProof(
        submitted.detectionToken,
        "detection",
        user.id
      );

      if (
        !detection ||
        detection.kind !== "detection" ||
        detection.answerHash !== answerHash
      ) {
        return NextResponse.json(
          { error: "Answer verification expired or is invalid." },
          { status: 400 }
        );
      }

      if (submitted.status === "ai") {
        if (!detection.isAI) {
          return NextResponse.json(
            { error: "Invalid answer classification." },
            { status: 400 }
          );
        }

        trustedReviews.push({
          question: submitted.question,
          prompt: submitted.prompt,
          answer,
          score: 0,
          status: "ai",
          reason: detection.reason,
        });
        continue;
      }

      const evaluation = verifyInterviewProof(
        submitted.evaluationToken,
        "evaluation",
        user.id
      );

      if (
        !evaluation ||
        evaluation.kind !== "evaluation" ||
        evaluation.answerHash !== answerHash ||
        evaluation.question !== submitted.prompt ||
        evaluation.domain !== setup.domain ||
        evaluation.experience !== setup.experience ||
        evaluation.sessionId !== questionSet.sessionId ||
        evaluation.questionIndex !== index ||
        detection.isAI
      ) {
        return NextResponse.json(
          { error: "Answer verification expired or is invalid." },
          { status: 400 }
        );
      }

      feedbackDimensions.push(evaluation.feedback.dimensions);
      trustedReviews.push({
        question: submitted.question,
        prompt: submitted.prompt,
        answer,
        score: evaluation.feedback.compositeScore,
        status: "answered",
        reason: evaluation.feedback.dimensions
          .map((dimension) => `${dimension.label}: ${dimension.reason}`)
          .join(" "),
      });
    }

    const attemptedReviews = trustedReviews.filter(
      (review) => review.status !== "autoSkipped"
    );
    const attemptedCount = attemptedReviews.length;
    const attemptedAverage =
      attemptedCount > 0
        ? attemptedReviews.reduce((sum, review) => sum + review.score, 0) /
          attemptedCount
        : 0;
    const completionFactor =
      attemptedCount > 0
        ? 0.5 + 0.5 * (attemptedCount / TOTAL_QUESTIONS)
        : 0;
    const compositeScore = Math.round(attemptedAverage * completionFactor);

    const dimensions =
      feedbackDimensions.length > 0 && attemptedCount > 0
        ? zeroDimensions.map((fallback, index) => {
            const source = feedbackDimensions[0]?.[index] ?? fallback;
            const total = feedbackDimensions.reduce(
              (sum, item) => sum + (item[index]?.value ?? 0),
              0
            );

            return {
              ...source,
              value: Number(
                ((total / attemptedCount) * completionFactor).toFixed(1)
              ),
            };
          })
        : zeroDimensions;

    const questionScores = trustedReviews.map((review) => ({
      question: review.question,
      score: review.score,
    }));
    const generatedSummary = await generateInterviewSummary(
      input.completionReason,
      trustedReviews
    );
    const summary = {
      sessionAttemptId: questionSet.sessionId,
      completionReason: input.completionReason,
      attemptedQuestions: attemptedCount,
      totalQuestions: TOTAL_QUESTIONS,
      completionFactor,
      ...generatedSummary,
      questionReviews: trustedReviews.map((review) => {
        const generated = generatedSummary.questionReviews.find(
          (item) => item.question === review.question
        );
        return {
          ...review,
          summary: generated?.summary,
          improvement: generated?.improvement,
        };
      }),
    };

    const { data: inserted, error } = await admin
      .from("interview_sessions")
      .insert({
        user_id: user.id,
        role: setup.domain,
        experience: setup.experience,
        company_type: setup.companyType,
        composite_score: compositeScore,
        dimensions,
        question_scores: questionScores,
        summary,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "The interview result could not be saved." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionId: inserted.id,
      compositeScore,
      dimensions,
      questionScores,
      summary,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
