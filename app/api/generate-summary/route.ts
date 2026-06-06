import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/server/auth";
import { checkRateLimit } from "@/lib/server/rateLimit";
import { generateInterviewSummary } from "@/lib/server/summary";
import type { QuestionReview } from "@/lib/types";
import {
  COMPLETION_REASONS,
  isAllowedValue,
  isPlainObject,
  readJsonBody,
  REVIEW_STATUSES,
} from "@/lib/validation";

export async function POST(req: NextRequest) {
  const { user } = await getAuthenticatedContext();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit(
    `generate-summary:${user.id}`,
    15,
    10 * 60 * 1000
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many summary requests. Please wait and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const body = await readJsonBody(req, 64_000);
  if (!body.ok) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const input = body.data;
    if (
      !isPlainObject(input) ||
      !isAllowedValue(input.completionReason, COMPLETION_REASONS) ||
      !Array.isArray(input.questionReviews) ||
      input.questionReviews.length !== 5 ||
      input.questionReviews.some(
        (review) =>
          !isPlainObject(review) ||
          typeof review.question !== "string" ||
          typeof review.prompt !== "string" ||
          typeof review.score !== "number" ||
          !isAllowedValue(review.status, REVIEW_STATUSES)
      )
    ) {
      return NextResponse.json(
        { error: "Invalid summary input." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      await generateInterviewSummary(
        input.completionReason,
        input.questionReviews as QuestionReview[]
      )
    );
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
