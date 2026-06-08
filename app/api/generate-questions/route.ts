import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAuthenticatedContext } from "@/lib/server/auth";
import { withApiErrorHandler } from "@/lib/server/apiError";
import { createInterviewProof } from "@/lib/server/interviewProof";
import { logServerError } from "@/lib/server/errorLog";
import { checkRateLimit } from "@/lib/server/rateLimit";
import { enforceRequestAbuseGuards } from "@/lib/server/requestAbuse";
import {
  isValidSetup,
  readJsonBody,
} from "@/lib/validation";

async function postGenerateQuestions(req: NextRequest) {
  const { user } = await getAuthenticatedContext();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit(
    `generate-questions:${user.id}`,
    12,
    10 * 60 * 1000
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many question requests. Please wait and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

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

  try {
    const input = body.data;
    if (!isValidSetup(input)) {
      return NextResponse.json(
        { error: "Invalid interview setup." },
        { status: 400 }
      );
    }

    const { domain, experience, companyType } = input;
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      logServerError("Question generation is not configured", new Error("Missing GROQ_API_KEY"));
      return NextResponse.json(
        { error: "Question generation is unavailable." },
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
              content: `Generate exactly 5 high-quality mock interview questions for a ${experience} candidate applying for a ${domain} role at a ${companyType} company.

Question mix:
- 2 role-specific technical questions that test real ${domain} knowledge, tradeoffs, debugging, implementation details, or architecture decisions
- 1 practical problem-solving scenario with a clear constraint
- 1 behavioral question requiring a specific example, actions, outcome, and reflection
- 1 company-fit question tailored to a ${companyType} environment

Calibrate difficulty to ${experience}. Avoid generic questions. Each question must be one clear sentence or two short sentences and require reasoning.

Return a JSON array of exactly 5 strings. No preamble or markdown.`,
            },
          ],
          max_tokens: 1024,
        }),
      }
    );

    if (!response.ok) {
      logServerError("Question generation provider failed", {
        status: response.status,
        statusText: response.statusText,
      });
      return NextResponse.json(
        { error: "Question generation is temporarily unavailable." },
        { status: 502 }
      );
    }

    const json = await response.json();
    const text = json.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) {
      logServerError("Question generation returned malformed content", {
        textPreview: text.slice(0, 500),
      });
      return NextResponse.json(
        { error: "Question generation is temporarily unavailable." },
        { status: 502 }
      );
    }

    const questions: unknown = JSON.parse(match[0]);
    if (
      !Array.isArray(questions) ||
      questions.length !== 5 ||
      questions.some(
        (question) =>
          typeof question !== "string" ||
          question.trim().length < 8 ||
          question.length > 1200
      )
    ) {
      logServerError("Question generation returned invalid question payload", {
        questions,
      });
      return NextResponse.json(
        { error: "Question generation is temporarily unavailable." },
        { status: 502 }
      );
    }

    const normalizedQuestions = questions.map((question) => question.trim());
    const sessionId = randomUUID();
    const questionSetToken = createInterviewProof({
      kind: "questionSet",
      version: 1,
      userId: user.id,
      sessionId,
      domain,
      experience,
      companyType,
      questions: normalizedQuestions,
      issuedAt: Date.now(),
    });

    return NextResponse.json({
      questions: normalizedQuestions,
      questionSetToken,
    });
  } catch (error) {
    logServerError("Question generation request failed", error, {
      userId: user.id,
    });
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export const POST = withApiErrorHandler(
  postGenerateQuestions,
  "Unhandled question generation API error"
);
