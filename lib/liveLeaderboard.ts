import { getRankChangeLabel, toLeaderboardEntries } from "@/lib/ranking";
import type { LeaderboardEntry } from "@/lib/types";

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

      return (a.sessions ?? 999) - (b.sessions ?? 999);
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
  const college = row.college?.trim();

  return {
    rank: row.rank,
    name:
      currentUserId && row.user_id === currentUserId
        ? "You"
        : row.name?.trim() || "PrepPeer user",
    subtitle: `${college ? `${college} - ` : ""}${role} - ${companyType}`,
    role,
    companyType,
    score: Number(row.score ?? 0),
    sessions: Number(row.sessions ?? 0),
    isYou: currentUserId === row.user_id,
    trend: "flat",
    source: "real",
    userId: row.user_id,
    previousScore: row.previous_score,
  };
};

const getBestRealRowsByUser = (rows: SupabaseLeaderboardRow[]) => {
  const bestByUser = new Map<string, SupabaseLeaderboardRow>();

  rows.forEach((row) => {
    if (!row.user_id) return;

    const current = bestByUser.get(row.user_id);
    const score = Number(row.score ?? 0);
    const currentScore = Number(current?.score ?? -1);

    if (!current || score > currentScore) {
      bestByUser.set(row.user_id, row);
      return;
    }

    if (score === currentScore) {
      bestByUser.set(row.user_id, {
        ...current,
        sessions: Math.max(Number(current.sessions ?? 0), Number(row.sessions ?? 0)),
      });
    }
  });

  return Array.from(bestByUser.values());
};

export const toLiveLeaderboardEntries = (
  rows: SupabaseLeaderboardRow[],
  currentUserId?: string
): LeaderboardEntry[] => {
  const benchmarkEntries: InternalLeaderboardEntry[] = toLeaderboardEntries([]).map(
    (entry) => ({
      ...entry,
      isYou: false,
      source: "demo",
    })
  );

  const realEntries = getBestRealRowsByUser(rows).map((row) =>
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
