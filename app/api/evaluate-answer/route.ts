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
import { isAgentConfigured } from "@/lib/server/agents/groq";
import { evaluateInterviewAnswer } from "@/lib/server/agents/evaluationWorkflow";
import { parseEvaluationInput, readJsonBody } from "@/lib/validation";

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
    opaqueFieldNames: ["questionSetToken"],
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

    if (!isAgentConfigured()) {
      logServerError("Evaluation is not configured", new Error("Missing GROQ_API_KEY"));
      return NextResponse.json(
        { error: "Evaluation is unavailable." },
        { status: 503 }
      );
    }

    let feedback;
    try {
      feedback = await evaluateInterviewAnswer(input);
    } catch (error) {
      logServerError("Multi-agent evaluation workflow failed", error, {
        userId: user.id,
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
