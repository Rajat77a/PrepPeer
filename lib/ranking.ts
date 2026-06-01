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

export type LeaderboardUserProfile = {
  name?: string;
  college?: string;
};

const BENCHMARK_WINDOW_MS = 5 * 60 * 1000;

const benchmarkFirstNames = [
  "Aarav",
  "Aditi",
  "Advait",
  "Akshay",
  "Ananya",
  "Anika",
  "Arjun",
  "Dev",
  "Diya",
  "Ishaan",
  "Kabir",
  "Karthik",
  "Meera",
  "Naina",
  "Neha",
  "Nikhil",
  "Priya",
  "Rahul",
  "Riya",
  "Rohan",
  "Rohit",
  "Saanvi",
  "Sneha",
  "Tanvi",
  "Vikram",
];

const benchmarkLastInitials = [
  "A.",
  "B.",
  "C.",
  "D.",
  "G.",
  "I.",
  "J.",
  "K.",
  "M.",
  "N.",
  "P.",
  "R.",
  "S.",
  "T.",
  "V.",
];

const benchmarkColleges = [
  "NIT Trichy",
  "IIT Bombay",
  "BITS Pilani",
  "IIT Delhi",
  "PSG Tech",
  "SRM Chennai",
  "BITS Goa",
  "NIT Warangal",
  "VIT Vellore",
  "IIT Roorkee",
  "NIT Calicut",
  "Manipal",
  "IIT Madras",
  "IIIT Hyderabad",
  "Delhi University",
  "Christ University",
  "BITS Hyderabad",
  "NIT Surat",
];

const benchmarkRoles = [
  "SDE Fresher",
  "Product Manager",
  "SDE",
  "Operations",
  "Data Analyst",
  "MBA",
];

const benchmarkCompanies = [
  "Product Company",
  "Consumer App",
  "Fintech",
  "Marketplace",
  "Product Startup",
  "Consulting",
  "SaaS",
  "Enterprise",
  "Logistics",
];

const seededJitter = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const getBenchmarkWindow = () => Math.floor(Date.now() / BENCHMARK_WINDOW_MS);

const getGeneratedBenchmarkProfile = (index: number) => {
  const firstName = benchmarkFirstNames[index % benchmarkFirstNames.length];
  const lastInitial =
    benchmarkLastInitials[
      Math.floor(index / benchmarkFirstNames.length) % benchmarkLastInitials.length
    ];

  return {
    name: `${firstName} ${lastInitial}`,
    college: benchmarkColleges[(index * 7) % benchmarkColleges.length],
    role: benchmarkRoles[(index * 5) % benchmarkRoles.length],
    company: benchmarkCompanies[(index * 4) % benchmarkCompanies.length],
  };
};

const getBenchmarkScore = (index: number, windowId: number) => {
  const baseScore = Math.max(24, 96 - index * 0.26);
  const personalRhythm = seededJitter((index + 1) * 97) * Math.PI * 2;
  const formDrift = Math.sin(windowId * 0.75 + personalRhythm) * 1.45;
  const dailyVariance =
    (seededJitter(Math.floor(windowId / 288) * 313 + index) - 0.5) * 0.7;

  return Number(
    Math.max(18, Math.min(98, baseScore + formDrift + dailyVariance)).toFixed(1)
  );
};

const getBenchmarkSessions = (windowId = getBenchmarkWindow()): InterviewSessionRow[] =>
  Array.from({ length: 250 }, (_, index) => {
    const profile = getGeneratedBenchmarkProfile(index);

    return {
      id: `benchmark-${index + 1}`,
      user_id: `benchmark-${index + 1}`,
      role: profile.role,
      experience:
        index % 3 === 0 ? "0-1 years" : index % 3 === 1 ? "1-3 years" : "3-6 years",
      company_type: profile.company,
      composite_score: getBenchmarkScore(index, windowId),
      created_at: new Date(Date.now() - index * 3600000).toISOString(),
      summary: {
        name: profile.name,
        college: profile.college,
        previousScore: getBenchmarkScore(index, windowId - 1),
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

const getBestByUser = (sessions: InterviewSessionRow[]) => {
  const bestByUser = new Map<string, InterviewSessionRow>();

  sessions.forEach((session) => {
    const current = bestByUser.get(session.user_id);
    const sessionTime = new Date(session.created_at ?? 0).getTime();
    const currentTime = new Date(current?.created_at ?? 0).getTime();
    const score = getScore(session);
    const currentScore = current ? getScore(current) : -1;

    if (
      !current ||
      score > currentScore ||
      (score === currentScore && sessionTime > currentTime)
    ) {
      bestByUser.set(session.user_id, session);
    }
  });

  return Array.from(bestByUser.values());
};

const withBenchmarkSessions = (
  sessions: InterviewSessionRow[],
  windowId = getBenchmarkWindow()
) => [
  ...getBenchmarkSessions(windowId),
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
  currentBestSessionId: string
) => {
  if (userId.startsWith("benchmark-")) {
    const previousBenchmarked = withBenchmarkSessions(
      allSessions.filter((session) => !session.user_id.startsWith("benchmark-")),
      getBenchmarkWindow() - 1
    );

    return (
      rankSessions(getBestByUser(previousBenchmarked)).find(
        (session) => session.user_id === userId
      )?.rank ?? null
    );
  }

  const realSessions = allSessions.filter(
    (session) => !session.user_id.startsWith("benchmark-")
  );
  const userSessions = realSessions
    .filter((session) => session.user_id === userId)
    .sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime()
    );

  if (userSessions.length === 0) return null;

  const currentBestIsLatestAttempt = userSessions[0]?.id === currentBestSessionId;
  const previousRealSessions =
    userSessions.length > 1 && currentBestIsLatestAttempt
      ? realSessions.filter((session) => session.id !== currentBestSessionId)
      : realSessions;
  const previousBenchmarked = withBenchmarkSessions(
    previousRealSessions,
    getBenchmarkWindow() - 1
  );

  return (
    rankSessions(getBestByUser(previousBenchmarked)).find(
      (session) => session.user_id === userId
    )
      ?.rank ?? null
  );
};

export const getRankChangeLabel = (
  currentRank: number,
  previousRank: number | null
) => {
  if (!previousRank) return "new entry";
  if (previousRank === currentRank) return "→ steady";

  const movement = previousRank - currentRank;
  const places = Math.abs(movement);
  const placeLabel = places === 1 ? "rank" : "ranks";

  return movement > 0
    ? `↗ ${places} ${placeLabel}`
    : `↘ ${places} ${placeLabel}`;
};

export const getRankSummary = (
  allSessions: InterviewSessionRow[],
  userId?: string
): RankedSession | null => {
  const benchmarkedSessions = withBenchmarkSessions(allSessions);
  const rankedSessions = rankSessions(getBestByUser(benchmarkedSessions));
  const current = rankedSessions.find((session) => session.user_id === userId);

  if (!current || !userId) return null;

  const previousRank = getPreviousRank(benchmarkedSessions, userId, current.id);

  return {
    ...current,
    totalCandidates: rankedSessions.length,
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
  currentUserCollege?: string,
  userProfiles: Record<string, LeaderboardUserProfile> = {}
): LeaderboardEntry[] => {
  const benchmarkedSessions = withBenchmarkSessions(allSessions);
  const rankedSessions = rankSessions(getBestByUser(benchmarkedSessions));

  const entries: LeaderboardEntry[] = rankedSessions.map((session) => {
    const previousRank = getPreviousRank(benchmarkedSessions, session.user_id, session.id);
    const benchmarkProfile = session.user_id.startsWith("benchmark-")
      ? getBenchmarkProfile(session)
      : null;
    const realUserProfile = userProfiles[session.user_id];
    const sessionsCount = benchmarkProfile
      ? 1 + (Number(session.user_id.replace("benchmark-", "")) % 14)
      : allSessions.filter((item) => item.user_id === session.user_id).length;

    return {
      rank: session.rank,
      name:
        session.user_id === currentUserId
          ? "You"
          : realUserProfile?.name ??
            benchmarkProfile?.name ??
            "PrepPeer user",
      subtitle:
        session.user_id === currentUserId
          ? `${currentUserName}${currentUserCollege ? ` - ${currentUserCollege}` : ""}`
          : `${
              realUserProfile?.college ??
              benchmarkProfile?.college ??
              session.role ??
              "Interview"
            } - ${session.company_type ?? "General"}`,
      role: session.role ?? undefined,
      companyType: session.company_type ?? undefined,
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
      subtitle: `${currentUserName}${currentUserCollege ? ` - ${currentUserCollege}` : ""}`,
      role: undefined,
      companyType: undefined,
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

