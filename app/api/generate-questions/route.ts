import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/server/auth";
import { withApiErrorHandler } from "@/lib/server/apiError";
import { createInterviewProof } from "@/lib/server/interviewProof";
import { logServerError } from "@/lib/server/errorLog";
import { enforceCostRateLimit } from "@/lib/server/costRateLimit";
import { enforceRequestAbuseGuards } from "@/lib/server/requestAbuse";
import { isAgentConfigured } from "@/lib/server/agents/groq";
import {
  generateInterviewQuestions,
  readPreviousQuestions,
} from "@/lib/server/agents/questionWorkflow";
import { isValidSetup, readJsonBody } from "@/lib/validation";
import { createOptionalAdminClient } from "@/utils/supabase/admin";

const loadQuestionHistory = async (userId: string, role: string) => {
  const admin = createOptionalAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("interview_sessions")
    .select("summary")
    .eq("user_id", userId)
    .eq("role", role)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) {
    logServerError("Question history lookup failed", error, { userId });
    return [];
  }

  return readPreviousQuestions(Array.isArray(data) ? data : []);
};

async function postGenerateQuestions(req: NextRequest) {
  const { user } = await getAuthenticatedContext();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const costLimit = enforceCostRateLimit(
    `ai:generate-questions:${user.id}`,
    8,
    undefined,
    "Too many question generation requests. Please wait and try again."
  );
  if (costLimit) return costLimit;

  const body = await readJsonBody(req, 8_000);
  if (!body.ok) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const abuseGuard = enforceRequestAbuseGuards({
    request: req,
    userId: user.id,
    route: "generate-questions",
    body: body.data,
  });
  if (!abuseGuard.ok) return abuseGuard.response;

  if (!isValidSetup(body.data)) {
    return NextResponse.json(
      { error: "Invalid interview setup." },
      { status: 400 }
    );
  }

  if (!isAgentConfigured()) {
    logServerError(
      "Question agents are not configured",
      new Error("Missing GROQ_API_KEY")
    );
    return NextResponse.json(
      { error: "Question generation is unavailable." },
      { status: 503 }
    );
  }

  try {
    const setup = body.data;
    const previousQuestions = await loadQuestionHistory(user.id, setup.domain);
    const questions = await generateInterviewQuestions(
      setup,
      previousQuestions
    );
    const sessionId = randomUUID();

    const questionSetToken = createInterviewProof({
      kind: "questionSet",
      version: 1,
      userId: user.id,
      sessionId,
      domain: setup.domain,
      experience: setup.experience,
      companyType: setup.companyType,
      questions,
      currentIndex: 0,
      issuedAt: Date.now(),
    });

    return NextResponse.json(
      {
        questions,
        question: questions[0],
        questionIndex: 0,
        totalQuestions: questions.length,
        questionSetToken,
      },
      {
        headers: {
          "Cache-Control": "no-store, private",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    logServerError("Multi-agent question workflow failed", error, {
      userId: user.id,
    });
    return NextResponse.json(
      { error: "Question generation is temporarily unavailable." },
      { status: 502 }
    );
  }
}

export const POST = withApiErrorHandler(
  postGenerateQuestions,
  "Unhandled question generation API error"
);
