import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/server/auth";
import { checkRateLimit } from "@/lib/server/rateLimit";
import { enforceRequestAbuseGuards } from "@/lib/server/requestAbuse";
import { generateInterviewSummary } from "@/lib/server/summary";
import {
  parseSummaryInput,
  readJsonBody,
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

  const abuseGuard = enforceRequestAbuseGuards({
    request: req,
    userId: user.id,
    route: "generate-summary",
    body: body.data,
  });
  if (!abuseGuard.ok) return abuseGuard.response;

  try {
    const input = parseSummaryInput(body.data);
    if (!input) {
      return NextResponse.json(
        {
          error:
            "Invalid summary input. Check all required fields and value limits.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      await generateInterviewSummary(
        input.completionReason,
        input.questionReviews
      )
    );
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
