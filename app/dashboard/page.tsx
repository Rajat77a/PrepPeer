import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  DashboardHome,
  type DashboardSession,
} from "@/components/dashboard/DashboardHome";
import {
  getRankPercentileLabel,
  getRankSummary,
  toLeaderboardEntries,
  type InterviewSessionRow,
} from "@/lib/ranking";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/utils/supabase/user";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Track your interview sessions, scores, and rank improvement over time.",
};

export default async function DashboardPage() {
  cookies();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const name =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "PrepPeer user";
  const firstName = name.split(" ")[0] ?? "there";
  const supabase = createClient(cookies());
  const { data: rows } = await supabase
    .from("interview_sessions")
    .select(
      "id,user_id,role,experience,company_type,composite_score,dimensions,question_scores,summary,created_at"
    )
    .order("created_at", { ascending: false })
    .limit(1000);

  const allSessions = (rows ?? []) as InterviewSessionRow[];
  const rankSummary = getRankSummary(allSessions, user.id);
  const leaderboardEntries = toLeaderboardEntries(
    allSessions,
    user.id,
    name,
    String(user.user_metadata?.college ?? "")
  );

  const userRank = rankSummary?.rank;
  const dashboardSessions: DashboardSession[] = allSessions
    .filter((session) => session.user_id === user.id)
    .slice(0, 10)
    .map((session, index) => ({
      id: session.id,
      date:
        index === 0
          ? "Latest"
          : session.created_at
            ? new Intl.DateTimeFormat("en", {
                month: "short",
                day: "numeric",
              }).format(new Date(session.created_at))
            : "Session",
      role: session.role ?? "Interview",
      experience: session.experience ?? "Not set",
      company: session.company_type ?? "General",
      score: Number(session.composite_score ?? 0),
      rank: index === 0 ? userRank : undefined,
      delta: index === 0 ? rankSummary?.rankChange : undefined,
    }));

  return (
    <DashboardHome
      firstName={firstName}
      sessions={dashboardSessions}
      leaderboardEntries={leaderboardEntries}
      rankSummary={
        rankSummary
          ? {
              rank: rankSummary.rank,
              totalCandidates: rankSummary.totalCandidates,
              score: rankSummary.score,
              percentile: getRankPercentileLabel(
                rankSummary.rank,
                rankSummary.totalCandidates
              ),
              rankChange: rankSummary.rankChange,
              role: rankSummary.role ?? "Interview",
              companyType: rankSummary.company_type ?? "General",
              dimensions: rankSummary.dimensions ?? undefined,
            }
          : null
      }
    />
  );
}
