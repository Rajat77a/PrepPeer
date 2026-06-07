import { getRankChangeLabel, toLeaderboardEntries } from "@/lib/ranking";
import type { LeaderboardEntry } from "@/lib/types";
import { getSafeOptionalString } from "@/lib/validation";

export type SupabaseLeaderboardRow = {
  rank: number;
  user_id: string;
  name: string | null;
  college?: string | null;
  role: string | null;
  company_type: string | null;
  score: number | null;
  sessions: number | null;
  previous_rank: number | null;
  rank_delta: number | null;
  previous_score: number | null;
};

type InternalLeaderboardEntry = LeaderboardEntry & {
  originalRank?: number;
  previousScore?: number | null;
  userId?: string;
};

const getEntryKey = (entry: InternalLeaderboardEntry) =>
  `${entry.source ?? "benchmark"}-${entry.userId ?? entry.name}-${entry.role ?? ""}-${
    entry.companyType ?? ""
  }`;

const sortEntries = (entries: InternalLeaderboardEntry[]) =>
  [...entries]
    .sort((a, b) => {
      if (Number(b.score) !== Number(a.score)) {
        return Number(b.score) - Number(a.score);
      }

      const sessionDiff = (b.sessions ?? 0) - (a.sessions ?? 0);
      if (sessionDiff !== 0) return sessionDiff;

      const rankDiff = (a.originalRank ?? 9999) - (b.originalRank ?? 9999);
      if (rankDiff !== 0) return rankDiff;

      return a.name.localeCompare(b.name);
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

const toRealEntry = (
  row: SupabaseLeaderboardRow,
  currentUserId?: string
): InternalLeaderboardEntry => {
  const role = row.role ?? "Interview";
  const companyType = row.company_type ?? "General";
  const college = getSafeOptionalString(row.college, 120);
  const name = getSafeOptionalString(row.name, 80, "PrepPeer user");

  return {
    rank: row.rank,
    name:
      currentUserId && row.user_id === currentUserId
        ? "You"
        : name || "PrepPeer user",
    subtitle: `${college ? `${college} - ` : ""}${role} - ${companyType}`,
    role,
    companyType,
    score: Number(row.score ?? 0),
    sessions: Number(row.sessions ?? 0),
    isYou: currentUserId === row.user_id,
    trend: "flat",
    source: "real",
    originalRank: row.rank,
    userId: row.user_id,
    previousScore: row.previous_score,
  };
};

const getRecentAverageRowsByUser = (rows: SupabaseLeaderboardRow[]) => {
  const rowsByUser = new Map<string, SupabaseLeaderboardRow[]>();

  rows.forEach((row) => {
    if (!row.user_id) return;
    rowsByUser.set(row.user_id, [...(rowsByUser.get(row.user_id) ?? []), row]);
  });

  return Array.from(rowsByUser.values()).map((userRows) => {
    const recentRows = userRows.slice(0, 5);
    const currentScoreAverage =
      recentRows.reduce((total, row) => total + Number(row.score ?? 0), 0) /
      Math.max(recentRows.length, 1);
    const previousScores = recentRows
      .map((row) => row.previous_score)
      .filter((score): score is number => typeof score === "number");
    const previousScoreAverage = previousScores.length
      ? previousScores.reduce((total, score) => total + Number(score), 0) /
        previousScores.length
      : null;
    const sessionTotal = Math.max(
      ...userRows.map((row) => Number(row.sessions ?? 0)),
      userRows.length
    );
    const representative = recentRows[0];

    return {
      ...representative,
      rank: Math.min(...userRows.map((row) => Number(row.rank ?? 9999))),
      score: Number(currentScoreAverage.toFixed(1)),
      sessions: sessionTotal || userRows.length,
      previous_score:
        previousScoreAverage === null
          ? null
          : Number(previousScoreAverage.toFixed(1)),
    };
  });
};

export const toLiveLeaderboardEntries = (
  rows: SupabaseLeaderboardRow[],
  currentUserId?: string
): LeaderboardEntry[] => {
  const benchmarkEntries: InternalLeaderboardEntry[] = toLeaderboardEntries([]).map(
    (entry) => ({
      ...entry,
      isYou: false,
      originalRank: entry.rank,
      source: "demo",
    })
  );

  const realEntries = getRecentAverageRowsByUser(rows).map((row) =>
    toRealEntry(row, currentUserId)
  );
  const currentEntries = sortEntries([...benchmarkEntries, ...realEntries]);
  const previousRealEntries = realEntries.map((entry) => ({
    ...entry,
    score: entry.previousScore ?? entry.score,
    sessions: Math.max((entry.sessions ?? 1) - 1, 1),
  }));
  const previousEntries = sortEntries([...benchmarkEntries, ...previousRealEntries]);

  return currentEntries.map((entry) => {
    if (entry.source !== "real") return entry;

    const previousEntry = previousEntries.find(
      (previous) => getEntryKey(previous) === getEntryKey(entry)
    );

    if (!previousEntry || entry.previousScore === null || entry.previousScore === undefined) {
      return {
        ...entry,
        delta: "new entry",
        deltaType: "up",
        trend: "up",
      };
    }

    const rankDelta = previousEntry.rank - entry.rank;
    const deltaType =
      rankDelta > 0 ? "up" : rankDelta < 0 ? "down" : "neutral";

    return {
      ...entry,
      delta:
        rankDelta === 0
          ? "steady"
          : getRankChangeLabel(entry.rank, previousEntry.rank),
      deltaType,
      trend: deltaType === "neutral" ? "flat" : deltaType,
    };
  });
};
