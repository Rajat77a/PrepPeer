import type { DimensionScore, LeaderboardEntry } from "@/lib/types";

export type InterviewSessionRow = {
  id: string;
  user_id: string;
  role: string | null;
  experience: string | null;
  company_type: string | null;
  composite_score: number | null;
  dimensions?: DimensionScore[] | null;
  question_scores?: { question: string; score: number }[] | null;
  summary?: unknown;
  created_at?: string | null;
};

export type RankedSession = InterviewSessionRow & {
  rank: number;
  totalCandidates: number;
  score: number;
  rankChange: string;
  previousRank: number | null;
};

const BENCHMARK_WINDOW_MS = 10 * 60 * 1000;

const benchmarkProfiles = [
  ["Arjun S.", "NIT Trichy", "SDE Fresher", "Product Company"],
  ["Priya M.", "IIT Bombay", "Product Manager", "Consumer App"],
  ["Rohit V.", "BITS Pilani", "SDE", "Fintech"],
  ["Sneha K.", "IIT Delhi", "Operations", "Marketplace"],
  ["Karthik R.", "PSG Tech", "SDE Fresher", "Product Startup"],
  ["Ananya S.", "IIT Bombay", "MBA", "Consulting"],
  ["Rahul D.", "SRM Chennai", "SDE Fresher", "SaaS"],
  ["Ishaan M.", "IIT Delhi", "Product Manager", "Enterprise"],
  ["Divya M.", "BITS Goa", "Operations", "Logistics"],
  ["Aditya K.", "NIT Warangal", "SDE", "Product Company"],
  ["Meera N.", "VIT Vellore", "Data Analyst", "Fintech"],
  ["Vikram N.", "IIT Roorkee", "SDE", "Product Startup"],
  ["Neha P.", "NIT Calicut", "Product Manager", "Consumer App"],
  ["Aman R.", "Manipal", "Operations", "Marketplace"],
  ["Riya G.", "IIT Madras", "MBA", "Consulting"],
  ["Dev S.", "IIIT Hyderabad", "SDE", "SaaS"],
  ["Pooja B.", "Delhi University", "Data Analyst", "Enterprise"],
  ["Nikhil J.", "BITS Hyderabad", "SDE Fresher", "Fintech"],
  ["Tanvi C.", "Christ University", "Product Manager", "Product Startup"],
  ["Harsh P.", "NIT Surat", "Operations", "Product Company"],
];

const seededJitter = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const getBenchmarkWindow = () => Math.floor(Date.now() / BENCHMARK_WINDOW_MS);

const getBenchmarkSessions = (windowId = getBenchmarkWindow()): InterviewSessionRow[] =>
  Array.from({ length: 250 }, (_, index) => {
    const profile = benchmarkProfiles[index % benchmarkProfiles.length];
    const baseScore = Math.max(22, 96 - Math.floor(index * 0.28));
    const jitter = Math.round((seededJitter(windowId * 251 + index) - 0.5) * 10);
    const previousJitter = Math.round(
      (seededJitter((windowId - 1) * 251 + index) - 0.5) * 10
    );

    return {
      id: `benchmark-${index + 1}`,
      user_id: `benchmark-${index + 1}`,
      role: profile[2],
      experience:
        index % 3 === 0 ? "0-1 years" : index % 3 === 1 ? "1-3 years" : "3-6 years",
      company_type: profile[3],
      composite_score: Math.max(18, Math.min(98, baseScore + jitter)),
      created_at: new Date(Date.now() - index * 3600000).toISOString(),
      summary: {
        name: profile[0],
        college: profile[1],
        previousScore: Math.max(18, Math.min(98, baseScore + previousJitter)),
      },
    };
  });

const getBenchmarkProfile = (session: InterviewSessionRow) =>
  session.summary as
    | { name?: string; college?: string; previousScore?: number }
    | undefined;

export const getDisplayName = (
  metadata: Record<string, unknown> | undefined,
  email?: string | null
) =>
  String(metadata?.full_name ?? metadata?.name ?? email?.split("@")[0] ?? "You");

const getScore = (session: InterviewSessionRow) =>
  Number(session.composite_score ?? 0);

const getLatestByUser = (sessions: InterviewSessionRow[]) => {
  const latestByUser = new Map<string, InterviewSessionRow>();

  sessions.forEach((session) => {
    const current = latestByUser.get(session.user_id);
    const sessionTime = new Date(session.created_at ?? 0).getTime();
    const currentTime = new Date(current?.created_at ?? 0).getTime();

    if (!current || sessionTime > currentTime) {
      latestByUser.set(session.user_id, session);
    }
  });

  return Array.from(latestByUser.values());
};

const withBenchmarkSessions = (sessions: InterviewSessionRow[]) => [
  ...getBenchmarkSessions(),
  ...sessions,
];

const rankSessions = (sessions: InterviewSessionRow[]) =>
  [...sessions]
    .sort((a, b) => {
      const scoreDiff = getScore(b) - getScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      return (
        new Date(a.created_at ?? 0).getTime() -
        new Date(b.created_at ?? 0).getTime()
      );
    })
    .map((session, index) => ({
      ...session,
      rank: index + 1,
      score: getScore(session),
    }));

const getPreviousRank = (
  allSessions: InterviewSessionRow[],
  userId: string,
  latestSessionId: string
) => {
  const userSessions = allSessions
    .filter((session) => session.user_id === userId && session.id !== latestSessionId)
    .sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime()
    );

  const previousUserSession = userSessions[0];
  if (!previousUserSession) return null;

  const replacementSessions = getLatestByUser(
    allSessions.map((session) =>
      session.user_id === userId && session.id === latestSessionId
        ? previousUserSession
        : session
    )
  );

  return (
    rankSessions(replacementSessions).find((session) => session.user_id === userId)
      ?.rank ?? null
  );
};

export const getRankChangeLabel = (
  currentRank: number,
  previousRank: number | null
) => {
  if (!previousRank) return "First ranked session";
  if (previousRank === currentRank) return "No rank change";

  const movement = previousRank - currentRank;
  return movement > 0 ? `Up ${movement}` : `Down ${Math.abs(movement)}`;
};

export const getRankSummary = (
  allSessions: InterviewSessionRow[],
  userId?: string
): RankedSession | null => {
  const benchmarkedSessions = withBenchmarkSessions(allSessions);
  const latestRanked = rankSessions(getLatestByUser(benchmarkedSessions));
  const current = latestRanked.find((session) => session.user_id === userId);

  if (!current || !userId) return null;

  const previousRank = getPreviousRank(benchmarkedSessions, userId, current.id);

  return {
    ...current,
    totalCandidates: latestRanked.length,
    previousRank,
    rankChange: getRankChangeLabel(current.rank, previousRank),
  };
};

export const getRankPercentileLabel = (rank: number, total: number) => {
  if (!total) return "Not ranked";
  if (rank === total) return `Rank #${rank}`;

  const percentile = Math.max(1, Math.round((rank / total) * 100));
  return `Top ${percentile}%`;
};

export const toLeaderboardEntries = (
  allSessions: InterviewSessionRow[],
  currentUserId?: string,
  currentUserName = "You",
  currentUserCollege?: string
): LeaderboardEntry[] => {
  const benchmarkedSessions = withBenchmarkSessions(allSessions);
  const latestRanked = rankSessions(getLatestByUser(benchmarkedSessions));

  const entries: LeaderboardEntry[] = latestRanked.map((session) => {
    const previousRank = getPreviousRank(benchmarkedSessions, session.user_id, session.id);
    const benchmarkProfile = session.user_id.startsWith("benchmark-")
      ? getBenchmarkProfile(session)
      : null;
    const sessionsCount = benchmarkProfile
      ? 1 + (Number(session.user_id.replace("benchmark-", "")) % 14)
      : allSessions.filter((item) => item.user_id === session.user_id).length;

    return {
      rank: session.rank,
      name:
        session.user_id === currentUserId
          ? "You"
          : benchmarkProfile?.name ?? `Candidate ${session.user_id.slice(0, 4)}`,
      subtitle:
        session.user_id === currentUserId
          ? `${currentUserName}${currentUserCollege ? ` · ${currentUserCollege}` : ""}`
          : `${benchmarkProfile?.college ?? session.role ?? "Interview"} · ${session.company_type ?? "General"}`,
      score: session.score,
      sessions: sessionsCount,
      delta: getRankChangeLabel(session.rank, previousRank),
      deltaType:
        previousRank === null || previousRank > session.rank
          ? "up"
          : previousRank < session.rank
            ? "down"
            : "neutral",
      isYou: session.user_id === currentUserId,
      trend:
        previousRank === null || previousRank === session.rank
          ? "flat"
          : previousRank > session.rank
            ? "up"
            : "down",
      source: "real" as const,
    };
  });

  if (currentUserId && !entries.some((entry) => entry.isYou)) {
    entries.push({
      rank: entries.length + 1,
      name: "You",
      subtitle: `${currentUserName}${currentUserCollege ? ` · ${currentUserCollege}` : ""}`,
      score: 0,
      sessions: 0,
      delta: "Start with your first interview",
      deltaType: "neutral",
      isYou: true,
      trend: "flat",
      source: "real",
    });
  }

  return entries;
};

