import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withApiErrorHandler } from "@/lib/server/apiError";
import {
  getDisplayName,
  getRankPercentileLabel,
  getRankSummary,
  type InterviewSessionRow,
} from "@/lib/ranking";
import {
  toLiveLeaderboardEntries,
  type SupabaseLeaderboardRow,
} from "@/lib/liveLeaderboard";
import { getTrustedDisplayMetadata } from "@/lib/profile";
import { logServerError } from "@/lib/server/errorLog";
import { enforceCostRateLimit } from "@/lib/server/costRateLimit";
import { requireProtectedRoute } from "@/lib/server/protectedRoute";
import {
  toPublicDimensions,
  toPublicQuestionScores,
  toPublicSessionSummary,
} from "@/lib/server/publicResponses";
import { createOptionalAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

async function getAccountResult(request: NextRequest) {
  const access = await requireProtectedRoute({
    request,
    resource: "account result",
    authorize: ({ user }) => Boolean(user.id),
  });

  if (!access.ok) return access.response;

  const { supabase, user } = access;

  const costLimit = enforceCostRateLimit(
    `db:account-result:${user.id}`,
    60,
    undefined,
    "Too many result refreshes. Please wait and try again."
  );
  if (costLimit) return costLimit;

  const { data: latestSession, error: latestSessionError } = await supabase
    .from("interview_sessions")
    .select(
      "id,user_id,role,experience,company_type,composite_score,dimensions,question_scores,summary,created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestSessionError) {
    logServerError("Account result session lookup failed", latestSessionError, {
      userId: user.id,
    });
    return NextResponse.json(
      { error: "The interview result could not be loaded." },
      { status: 500 }
    );
  }

  if (!latestSession) {
    return NextResponse.json({ error: "No session found" }, { status: 404 });
  }

  const fallbackRankSummary = getRankSummary(
    [latestSession as InterviewSessionRow],
    user.id
  );
  let currentRank = fallbackRankSummary?.rank ?? 0;
  let totalCandidates = fallbackRankSummary?.totalCandidates ?? 0;
  let rankDelta = fallbackRankSummary?.rankChange ?? "No ranked session yet";
  let percentile = fallbackRankSummary
    ? getRankPercentileLabel(
        fallbackRankSummary.rank,
        fallbackRankSummary.totalCandidates
      )
    : "Not ranked";

  const leaderboardSupabase = createOptionalAdminClient() ?? supabase;
  const { data: leaderboardRows, error: leaderboardError } =
    await leaderboardSupabase.rpc("get_leaderboard", {
      p_role: null,
      p_company_type: null,
    });

  if (leaderboardError) {
    logServerError("Unable to load the live result rank", leaderboardError, {
      userId: user.id,
    });
  } else if (leaderboardRows) {
    const leaderboardEntries = toLiveLeaderboardEntries(
      leaderboardRows as SupabaseLeaderboardRow[],
      user.id
    );
    const liveUserEntry = leaderboardEntries.find((entry) => entry.isYou);

    if (liveUserEntry) {
      currentRank = liveUserEntry.rank;
      totalCandidates = leaderboardEntries.length;
      rankDelta = liveUserEntry.delta ?? rankDelta;
      percentile = getRankPercentileLabel(currentRank, totalCandidates);
    }
  }

  return NextResponse.json({
    name: getDisplayName(getTrustedDisplayMetadata(user), user.email),
    role: latestSession.role ?? "Interview",
    companyType: latestSession.company_type ?? "General",
    source: "account",
    compositeScore: Number(latestSession.composite_score ?? 0),
    percentile,
    rankDelta,
    previousRank: fallbackRankSummary?.previousRank ?? 0,
    currentRank,
    totalCandidates,
    dimensions: toPublicDimensions(latestSession.dimensions),
    questionScores: toPublicQuestionScores(latestSession.question_scores),
    summary: toPublicSessionSummary(latestSession.summary),
  });
}

export const GET = withApiErrorHandler(
  getAccountResult,
  "Unhandled account result API error"
);
