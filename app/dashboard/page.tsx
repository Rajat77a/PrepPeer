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
import { getLeaderboardUserProfiles } from "@/lib/leaderboardProfiles";
import {
  toLiveLeaderboardEntries,
  type SupabaseLeaderboardRow,
} from "@/lib/liveLeaderboard";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/utils/supabase/user";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Track your interview sessions, scores, and rank improvement over time.",
};

type ScoreDimension = {
  label: string;
  value: number;
  color?: string;
  reason?: string;
};

const zeroDimensions: ScoreDimension[] = [
  { label: "Communication", value: 0 },
  { label: "Problem Solving", value: 0 },
  { label: "Specificity", value: 0 },
  { label: "Accuracy", value: 0 },
];

const normalizeScoreBreakdown = (
  dimensions: unknown,
  compositeScore: number
): ScoreDimension[] => {
  if (!Array.isArray(dimensions) || compositeScore <= 0) {
    return zeroDimensions;
  }

  const orderedDimensions = zeroDimensions.map((fallbackDimension) => {
    const existing = dimensions.find((dimension): dimension is ScoreDimension => {
      if (
        typeof dimension !== "object" ||
        dimension === null ||
        !("label" in dimension)
      ) {
        return false;
      }

      return (
        String(dimension.label).toLowerCase() ===
        fallbackDimension.label.toLowerCase()
      );
    });

    return {
      ...fallbackDimension,
      ...existing,
      value:
        typeof existing?.value === "number" && Number.isFinite(existing.value)
          ? existing.value
          : 0,
    };
  });

  const currentDimensionTotal = orderedDimensions.reduce(
    (sum, dimension) => sum + dimension.value,
    0
  );

  if (currentDimensionTotal <= 0) {
    return zeroDimensions;
  }

  const expectedDimensionTotal = (compositeScore / 100) * 40;
  const scale = expectedDimensionTotal / currentDimensionTotal;

  return orderedDimensions.map((dimension) => ({
    ...dimension,
    value: Number(
      Math.max(0, Math.min(10, dimension.value * scale)).toFixed(1)
    ),
  }));
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const name =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "PrepPeer user";

  const firstName = name.split(" ")[0] ?? "there";
  const profileRole = String(user.user_metadata?.target_role ?? "Interview");
  const profileExperience = String(user.user_metadata?.experience_level ?? "Not set");
  const profileCompanyType = String(
    user.user_metadata?.target_company_type ?? "General"
  );
  const supabase = createClient(cookieStore);

  const { data: rows } = await supabase
    .from("interview_sessions")
    .select(
      "id,user_id,role,experience,company_type,composite_score,dimensions,question_scores,summary,created_at"
    )
    .order("created_at", { ascending: false })
    .limit(1000);
  const { data: leaderboardRows } = await supabase.rpc("get_leaderboard", {
    p_role: null,
    p_company_type: null,
  });

  const userProfiles = await getLeaderboardUserProfiles(supabase);
  userProfiles[user.id] = {
    ...(userProfiles[user.id] ?? {}),
    name,
    college: String(user.user_metadata?.college ?? ""),
    role: profileRole,
    companyType: profileCompanyType,
  };

  const allSessions = (rows ?? []) as InterviewSessionRow[];
  const userSessions = allSessions.filter((session) => session.user_id === user.id);
  const latestUserSession = userSessions[0] ?? null;

  const rankSummary = getRankSummary(allSessions, user.id);
  const fallbackLeaderboardEntries = toLeaderboardEntries(
    allSessions,
    user.id,
    name,
    String(user.user_metadata?.college ?? ""),
    userProfiles
  );
  const leaderboardEntries = leaderboardRows
    ? toLiveLeaderboardEntries(
        (leaderboardRows ?? []) as SupabaseLeaderboardRow[],
        user.id
      )
    : fallbackLeaderboardEntries;

  const userRank = rankSummary?.rank;
  const latestScore = Number(latestUserSession?.composite_score ?? 0);
  const latestDimensions = normalizeScoreBreakdown(
    latestUserSession?.dimensions,
    latestScore
  );

  const dashboardSessions: DashboardSession[] = userSessions
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
      recentSessionScore={latestUserSession ? latestScore : null}
      rankSummary={
        rankSummary
          ? {
              rank: rankSummary.rank,
              totalCandidates: rankSummary.totalCandidates,
              score: latestScore,
              percentile: getRankPercentileLabel(
                rankSummary.rank,
                rankSummary.totalCandidates
              ),
              rankChange: rankSummary.rankChange,
              role: profileRole,
              companyType: profileCompanyType,
              experience: profileExperience,
              dimensions: latestDimensions,
            }
          : null
      }
    />
  );
}
