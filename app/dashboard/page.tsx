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
import { getTrustedProfile } from "@/lib/profile";
import { createOptionalAdminClient } from "@/utils/supabase/admin";
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

const getAverageScoreBreakdown = (
  sessions: InterviewSessionRow[]
): ScoreDimension[] => {
  const validBreakdowns = sessions
    .map((session) =>
      normalizeScoreBreakdown(
        session.dimensions,
        Number(session.composite_score ?? 0)
      )
    )
    .filter((dimensions) =>
      dimensions.some((dimension) => Number(dimension.value) > 0)
    );

  if (validBreakdowns.length === 0) {
    return zeroDimensions;
  }

  return zeroDimensions.map((baseDimension, index) => {
    const average =
      validBreakdowns.reduce(
        (total, dimensions) => total + Number(dimensions[index]?.value ?? 0),
        0
      ) / validBreakdowns.length;

    return {
      ...baseDimension,
      value: Number(average.toFixed(1)),
    };
  });
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const profile = getTrustedProfile(user);
  const name = profile.fullName || user.email?.split("@")[0] || "PrepPeer user";

  const firstName = name.split(" ")[0] ?? "there";
  const profileRole = profile.role || "Interview";
  const profileExperience = profile.experience || "Not set";
  const profileCompanyType = profile.company || "General";

  const supabase = createClient(cookieStore);
  const leaderboardSupabase = createOptionalAdminClient() ?? supabase;

  const { data: rows } = await supabase
    .from("interview_sessions")
    .select(
      "id,user_id,role,experience,company_type,composite_score,dimensions,question_scores,summary,created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1000);

  const { data: leaderboardRows, error: leaderboardError } =
    await leaderboardSupabase.rpc(
    "get_leaderboard",
    {
      p_role: null,
      p_company_type: null,
    }
  );

  if (leaderboardError) {
    console.error(
      "Unable to load the live dashboard leaderboard:",
      leaderboardError.message
    );
  }

  const userProfiles = await getLeaderboardUserProfiles(leaderboardSupabase);

  userProfiles[user.id] = {
    ...(userProfiles[user.id] ?? {}),
    name,
    college: profile.college,
    role: profileRole,
    companyType: profileCompanyType,
  };

  const userSessions = (rows ?? []) as InterviewSessionRow[];
  const latestUserSession = userSessions[0] ?? null;

  const sessionRankSummary = getRankSummary(userSessions, user.id);

  const fallbackLeaderboardEntries = toLeaderboardEntries(
    userSessions,
    user.id,
    name,
    profile.college,
    userProfiles
  );

  const leaderboardEntries = !leaderboardError && leaderboardRows
    ? toLiveLeaderboardEntries(
        (leaderboardRows ?? []) as SupabaseLeaderboardRow[],
        user.id
      )
    : fallbackLeaderboardEntries;

  const liveUserEntry = leaderboardEntries.find((entry) => entry.isYou);
  const unifiedRank = liveUserEntry?.rank ?? sessionRankSummary?.rank;
  const unifiedTotalCandidates =
    leaderboardEntries.length || sessionRankSummary?.totalCandidates || 0;
  const unifiedRankChange =
    liveUserEntry?.delta ?? sessionRankSummary?.rankChange ?? "new entry";

  const userRank = unifiedRank;
  const latestScore = Number(latestUserSession?.composite_score ?? 0);
  const averageDimensions = getAverageScoreBreakdown(userSessions);

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
      delta: index === 0 ? unifiedRankChange : undefined,
    }));

  return (
    <DashboardHome
      firstName={firstName}
      sessions={dashboardSessions}
      leaderboardEntries={leaderboardEntries}
      recentSessionScore={latestUserSession ? latestScore : null}
      profileContext={{
        role: profileRole,
        experience: profileExperience,
        companyType: profileCompanyType,
      }}
      rankSummary={
        unifiedRank
          ? {
              rank: unifiedRank,
              totalCandidates: unifiedTotalCandidates,
              score: latestScore,
              percentile: getRankPercentileLabel(
                unifiedRank,
                unifiedTotalCandidates
              ),
              rankChange: unifiedRankChange,
              role: profileRole,
              companyType: profileCompanyType,
              experience: profileExperience,
              dimensions: averageDimensions,
            }
          : null
      }
    />
  );
}
