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
  const latestRanked = rankSessions(getLatestByUser(allSessions));
  const current = latestRanked.find((session) => session.user_id === userId);

  if (!current || !userId) return null;

  const previousRank = getPreviousRank(allSessions, userId, current.id);

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
  const latestRanked = rankSessions(getLatestByUser(allSessions));

  const entries: LeaderboardEntry[] = latestRanked.map((session) => {
    const previousRank = getPreviousRank(allSessions, session.user_id, session.id);

    return {
      rank: session.rank,
      name: session.user_id === currentUserId ? "You" : `Candidate ${session.user_id.slice(0, 4)}`,
      subtitle:
        session.user_id === currentUserId
          ? `${currentUserName}${currentUserCollege ? ` · ${currentUserCollege}` : ""}`
          : `${session.role ?? "Interview"} · ${session.company_type ?? "General"}`,
      score: session.score,
      sessions: allSessions.filter((item) => item.user_id === session.user_id).length,
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
