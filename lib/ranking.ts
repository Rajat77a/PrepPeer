import type { DimensionScore, LeaderboardEntry } from "@/lib/types";
import { getSafeOptionalString } from "@/lib/validation";

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
  role?: string;
  companyType?: string;
};

const BENCHMARK_WINDOW_MS = 5 * 60 * 1000;

const benchmarkFirstNames = [
  "Aarav",
  "Aditi",
  "Aditya",
  "Akshay",
  "Ananya",
  "Anika",
  "Arjun",
  "Devika",
  "Diya",
  "Ishaan",
  "Kabir",
  "Karthik",
  "Meera",
  "Naina",
  "Neha",
  "Nikhil",
  "Pranav",
  "Priya",
  "Rahul",
  "Riya",
  "Rohan",
  "Rohit",
  "Saanvi",
  "Sneha",
  "Tanvi",
  "Varun",
  "Vikram",
  "Yash",
  "Aisha",
  "Akhil",
  "Amrita",
  "Anirudh",
  "Anjali",
  "Ankit",
  "Anushka",
  "Aryan",
  "Avani",
  "Bhavya",
  "Charvi",
  "Chirag",
  "Daksh",
  "Deepika",
  "Divya",
  "Esha",
  "Gaurav",
  "Harsh",
  "Ira",
  "Janvi",
  "Jay",
  "Kavya",
  "Krish",
  "Lakshmi",
  "Madhav",
  "Mahika",
  "Manav",
  "Mira",
  "Navya",
  "Nirav",
  "Nisha",
  "Omkar",
  "Parth",
  "Pooja",
  "Reyansh",
  "Sanika",
  "Sarthak",
  "Shreya",
  "Siddharth",
  "Simran",
  "Suhani",
  "Tara",
  "Tejas",
  "Vaishnavi",
  "Ved",
  "Vedant",
  "Zoya",
  "Abhinav",
  "Advika",
  "Alok",
  "Anaya",
  "Ansh",
  "Apoorva",
  "Arnav",
  "Ayush",
  "Bhumi",
  "Dev",
  "Dhruv",
  "Gayatri",
  "Harini",
  "Ishita",
  "Jatin",
  "Kiara",
  "Kunal",
  "Manasi",
  "Mayank",
  "Neel",
  "Palak",
  "Raghav",
  "Ritika",
  "Sahil",
  "Samaira",
  "Shivam",
  "Tanya",
  "Uday",
];

const benchmarkLastNames = [
  "Sharma",
  "Nair",
  "Menon",
  "Reddy",
  "Iyer",
  "Kapoor",
  "Mehta",
  "Rao",
  "Pillai",
  "Agarwal",
  "Verma",
  "Bose",
  "Krishnan",
  "Choudhary",
  "Malhotra",
  "Saxena",
  "Bhat",
  "Kulkarni",
  "Desai",
  "Joshi",
  "Patel",
  "Shah",
  "Gupta",
  "Singh",
  "Das",
  "Sen",
  "Mukherjee",
  "Chatterjee",
  "Banerjee",
  "Ghosh",
  "Chakraborty",
  "Chauhan",
  "Yadav",
  "Mishra",
  "Tiwari",
  "Tripathi",
  "Pandey",
  "Dubey",
  "Shukla",
  "Trivedi",
  "Shetty",
  "Hegde",
  "Kamath",
  "Naik",
  "Gowda",
  "Acharya",
  "Raman",
  "Narayanan",
  "Subramanian",
  "Raghavan",
  "Srinivasan",
  "Venkatesh",
  "Prasad",
  "Nambiar",
  "Thakur",
  "Mathur",
  "Bajaj",
  "Bhandari",
  "Sethi",
  "Khanna",
  "Batra",
  "Arora",
  "Grover",
  "Kohli",
  "Gill",
  "Sandhu",
  "Dhillon",
  "Sidhu",
  "Chopra",
  "Suri",
  "Luthra",
  "Wadhwa",
  "Madan",
  "Dutta",
  "Roy",
  "Pal",
  "Sarkar",
  "Biswas",
  "Mahajan",
  "Kashyap",
  "Sinha",
  "Jha",
  "Nayak",
  "Patnaik",
  "Mohanty",
  "Behera",
  "Panda",
  "Kurian",
  "Varghese",
  "Thomas",
  "Mathew",
  "George",
  "Dsouza",
  "Fernandes",
  "Lobo",
  "Monteiro",
  "Khan",
  "Ansari",
  "Qureshi",
  "Mirza",
  "Shaikh",
  "Syed",
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

const getBenchmarkWindow = (time = Date.now()) =>
  Math.floor(time / BENCHMARK_WINDOW_MS);

const getGeneratedBenchmarkProfile = (index: number) => {
  const firstName = benchmarkFirstNames[index % benchmarkFirstNames.length];
  const lastName =
    benchmarkLastNames[(index * 37) % benchmarkLastNames.length];

  return {
    name: `${firstName} ${lastName}`,
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

const getBenchmarkSessions = (
  windowId = getBenchmarkWindow(),
  referenceTime = Date.now()
): InterviewSessionRow[] =>
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
      created_at: new Date(referenceTime - index * 3600000).toISOString(),
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
  getSafeOptionalString(
    metadata?.full_name ?? metadata?.name ?? email?.split("@")[0],
    80,
    "You"
  ) || "You";

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
  windowId = getBenchmarkWindow(),
  referenceTime = Date.now()
) => [
  ...getBenchmarkSessions(windowId, referenceTime),
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

const getSessionTime = (session: InterviewSessionRow) => {
  const time = new Date(session.created_at ?? 0).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const getRankAfterSession = (
  realSessions: InterviewSessionRow[],
  userId: string,
  session: InterviewSessionRow
) => {
  const sessionTime = getSessionTime(session) || Date.now();
  const sessionsAtThatTime = realSessions.filter(
    (item) => getSessionTime(item) <= sessionTime
  );
  const rankedSessions = rankSessions(
    getBestByUser(
      withBenchmarkSessions(
        sessionsAtThatTime,
        getBenchmarkWindow(sessionTime),
        sessionTime
      )
    )
  );
  const current = rankedSessions.find((item) => item.user_id === userId);

  if (!current) return null;

  return {
    rank: current.rank,
    totalCandidates: rankedSessions.length,
  };
};

export type SessionRankSnapshot = {
  rank: number;
  totalCandidates: number;
  previousRank: number | null;
  rankChange: string;
};

export const getSessionRankHistory = (
  allSessions: InterviewSessionRow[],
  userId?: string
): Record<string, SessionRankSnapshot> => {
  if (!userId) return {};

  const realSessions = allSessions.filter(
    (session) => !session.user_id.startsWith("benchmark-")
  );
  const userSessions = realSessions
    .filter((session) => session.user_id === userId)
    .sort((a, b) => getSessionTime(a) - getSessionTime(b));
  const history: Record<string, SessionRankSnapshot> = {};
  let previousRank: number | null = null;

  userSessions.forEach((session) => {
    const snapshot = getRankAfterSession(realSessions, userId, session);
    if (!snapshot) return;

    history[session.id] = {
      ...snapshot,
      previousRank,
      rankChange: getRankChangeLabel(snapshot.rank, previousRank),
    };
    previousRank = snapshot.rank;
  });

  return history;
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
          ? `${currentUserName}${currentUserCollege ? ` - ${currentUserCollege}` : ""} - ${
              realUserProfile?.role ?? session.role ?? "Interview"
            } - ${realUserProfile?.companyType ?? session.company_type ?? "General"}`
          : `${
              realUserProfile?.college ??
              benchmarkProfile?.college ??
              session.role ??
              "Interview"
            } - ${
              realUserProfile?.role ?? session.role ?? "Interview"
            } - ${realUserProfile?.companyType ?? session.company_type ?? "General"}`,
      role: realUserProfile?.role ?? session.role ?? undefined,
      companyType:
        realUserProfile?.companyType ?? session.company_type ?? undefined,
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

