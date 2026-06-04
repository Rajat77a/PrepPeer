import { cookies } from "next/headers";
import { NextResponse } from "next/server";
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
import { createOptionalAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: sessionRows } = await supabase
    .from("interview_sessions")
    .select(
      "id,user_id,role,experience,company_type,composite_score,dimensions,question_scores,summary,created_at"
    )
    .order("created_at", { ascending: false })
    .limit(1000);

  const allSessions = (sessionRows ?? []) as InterviewSessionRow[];
  const latestSession = allSessions.find((session) => session.user_id === user.id);

  if (!latestSession) {
    return NextResponse.json({ error: "No session found" }, { status: 404 });
  }

  const fallbackRankSummary = getRankSummary(allSessions, user.id);
  let currentRank = fallbackRankSummary?.rank ?? 0;
  let totalCandidates = fallbackRankSummary?.totalCandidates ?? 0;
  let rankDelta = fallbackRankSummary?.rankChange ?? "No ranked session yet";
  let percentile = fallbackRankSummary
    ? getRankPercentileLabel(
        fallbackRankSummary.rank,
        fallbackRankSummary.totalCandidates
      )
    : "Not ranked";

  const leaderboardSupabase = createOptionalAdminClient();

  if (leaderboardSupabase) {
    const { data: leaderboardRows } = await leaderboardSupabase.rpc(
      "get_leaderboard",
      {
        p_role: null,
        p_company_type: null,
      }
    );

    if (leaderboardRows) {
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
  }

  return NextResponse.json({
    name: getDisplayName(user.user_metadata, user.email),
    role: latestSession.role ?? "Interview",
    companyType: latestSession.company_type ?? "General",
    source: "account",
    unlockedUserId: user.id,
    unlockedSessionId: latestSession.id,
    compositeScore: Number(latestSession.composite_score ?? 0),
    percentile,
    rankDelta,
    previousRank: fallbackRankSummary?.previousRank ?? 0,
    currentRank,
    totalCandidates,
    dimensions: latestSession.dimensions ?? [],
    questionScores: latestSession.question_scores ?? [],
    summary:
      latestSession.summary &&
      typeof latestSession.summary === "object" &&
      !Array.isArray(latestSession.summary)
        ? latestSession.summary
        : undefined,
  });
}
