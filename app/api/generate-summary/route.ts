import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/server/auth";
import { withApiErrorHandler } from "@/lib/server/apiError";
import { enforceCostRateLimit } from "@/lib/server/costRateLimit";
import { logServerError } from "@/lib/server/errorLog";
import { enforceRequestAbuseGuards } from "@/lib/server/requestAbuse";
import { generateInterviewSummary } from "@/lib/server/summary";
import {
  parseSummaryInput,
  readJsonBody,
} from "@/lib/validation";

async function postGenerateSummary(req: NextRequest) {
  const { user } = await getAuthenticatedContext();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const costLimit = enforceCostRateLimit(
    `ai:generate-summary:${user.id}`,
    10,
    undefined,
    "Too many summary generation requests. Please wait and try again."
  );
  if (costLimit) return costLimit;

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
  } catch (error) {
    logServerError("Summary request failed", error, { userId: user.id });
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export const POST = withApiErrorHandler(
  postGenerateSummary,
  "Unhandled summary generation API error"
);
