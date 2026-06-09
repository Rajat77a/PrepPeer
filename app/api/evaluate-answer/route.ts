import { NextRequest, NextResponse } from "next/server";
import { createZeroFeedback, evaluateAnswerQuality } from "@/lib/answerQuality";
import { getAuthenticatedContext } from "@/lib/server/auth";
import { withApiErrorHandler } from "@/lib/server/apiError";
import { logServerError } from "@/lib/server/errorLog";
import {
  createInterviewProof,
  hashAnswer,
  verifyInterviewProof,
} from "@/lib/server/interviewProof";
import { enforceCostRateLimit } from "@/lib/server/costRateLimit";
import { enforceRequestAbuseGuards } from "@/lib/server/requestAbuse";
import {
  normalizeFeedback,
  parseEvaluationInput,
  readJsonBody,
} from "@/lib/validation";

async function postEvaluateAnswer(req: NextRequest) {
  const { user } = await getAuthenticatedContext();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const costLimit = enforceCostRateLimit(
    `ai:evaluate-answer:${user.id}`,
    40,
    undefined,
    "Too many answer evaluation requests. Please wait and try again."
  );
  if (costLimit) return costLimit;

  const body = await readJsonBody(req);
  if (!body.ok) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const abuseGuard = enforceRequestAbuseGuards({
    request: req,
    userId: user.id,
    route: "evaluate-answer",
    body: body.data,
  });
  if (!abuseGuard.ok) return abuseGuard.response;

  try {
    const input = parseEvaluationInput(body.data);
    if (!input) {
      return NextResponse.json(
        { error: "Invalid evaluation input." },
        { status: 400 }
      );
    }

    const questionSet = verifyInterviewProof(
      input.questionSetToken,
      "questionSet",
      user.id
    );
    if (
      !questionSet ||
      questionSet.kind !== "questionSet" ||
      questionSet.domain !== input.domain ||
      questionSet.experience !== input.experience ||
      questionSet.questions[input.questionIndex] !== input.question
    ) {
      return NextResponse.json(
        { error: "The interview question set is invalid or expired." },
        { status: 400 }
      );
    }

    const answerQuality = evaluateAnswerQuality(input.answer, input.question);
    if (!answerQuality.valid) {
      const feedback = createZeroFeedback(answerQuality.reason);
      const evaluationToken = createInterviewProof({
        kind: "evaluation",
        version: 1,
        userId: user.id,
        question: input.question,
        answerHash: hashAnswer(input.answer),
        domain: input.domain,
        experience: input.experience,
        sessionId: questionSet.sessionId,
        questionIndex: input.questionIndex,
        feedback,
        issuedAt: Date.now(),
      });
      return NextResponse.json({ feedback, evaluationToken });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      logServerError("Evaluation is not configured", new Error("Missing GROQ_API_KEY"));
      return NextResponse.json(
        { error: "Evaluation is unavailable." },
        { status: 503 }
      );
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: `You are a strict technical interviewer. Evaluate whether the answer genuinely addresses the exact question.

Question: ${input.question}
Candidate level: ${input.experience}
Domain: ${input.domain}
Answer: ${input.answer}

Score Communication, Problem Solving, Specificity, and Accuracy from 0 to 10.
A meta-answer, filler, irrelevant response, or non-answer receives 0 on every dimension even if it is grammatical.
Only award high scores for question-specific, accurate reasoning with concrete details.

Return only:
{
  "compositeScore": 0,
  "dimensions": [
    {"label":"Communication","value":0,"reason":"one sentence"},
    {"label":"Problem Solving","value":0,"reason":"one sentence"},
    {"label":"Specificity","value":0,"reason":"one sentence"},
    {"label":"Accuracy","value":0,"reason":"one sentence"}
  ],
  "modelAnswer":"a strong concise model answer"
}`,
            },
          ],
          max_tokens: 1024,
        }),
      }
    );

    if (!response.ok) {
      logServerError("Evaluation provider failed", {
        status: response.status,
        statusText: response.statusText,
      });
      return NextResponse.json(
        { error: "Evaluation is temporarily unavailable." },
        { status: 502 }
      );
    }

    const json = await response.json();
    const text = json.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      logServerError("Evaluation returned malformed content", {
        textPreview: text.slice(0, 500),
      });
      return NextResponse.json(
        { error: "Evaluation is temporarily unavailable." },
        { status: 502 }
      );
    }

    const feedback = normalizeFeedback(JSON.parse(match[0]));
    if (!feedback) {
      logServerError("Evaluation returned invalid feedback payload", {
        payloadPreview: match[0].slice(0, 500),
      });
      return NextResponse.json(
        { error: "Evaluation is temporarily unavailable." },
        { status: 502 }
      );
    }

    const evaluationToken = createInterviewProof({
      kind: "evaluation",
      version: 1,
      userId: user.id,
      question: input.question,
      answerHash: hashAnswer(input.answer),
      domain: input.domain,
      experience: input.experience,
      sessionId: questionSet.sessionId,
      questionIndex: input.questionIndex,
      feedback,
      issuedAt: Date.now(),
    });

    return NextResponse.json({ feedback, evaluationToken });
  } catch (error) {
    logServerError("Evaluation request failed", error, {
      userId: user.id,
    });
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export const POST = withApiErrorHandler(
  postEvaluateAnswer,
  "Unhandled answer evaluation API error"
);
