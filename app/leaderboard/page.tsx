import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Navbar } from "@/components/ui/Navbar";
import { LeaderboardFilters } from "@/components/leaderboard/LeaderboardFilters";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { createClient } from "@/utils/supabase/server";
import { FULL_LEADERBOARD } from "@/lib/mockData";
import { getRankChangeLabel } from "@/lib/ranking";
import type { LeaderboardEntry } from "@/lib/types";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "See where you rank among SDE freshers and other roles — updated in real time.",
};

type SupabaseLeaderboardRow = {
  rank: number;
  user_id: string;
  name: string;
  role: string;
  company_type: string;
  score: number;
  sessions: number;
  previous_rank: number | null;
  rank_delta: number | null;
  previous_score: number | null;
};

type InternalLeaderboardEntry = LeaderboardEntry & {
  userId?: string;
  role?: string;
  companyType?: string;
  previousScore?: number | null;
};

const getEntryKey = (entry: InternalLeaderboardEntry) =>
  `${entry.userId ?? entry.name}-${entry.role ?? ""}-${entry.companyType ?? ""}`;

const toRealLeaderboardEntry = (
  item: SupabaseLeaderboardRow,
  currentUserId?: string
): InternalLeaderboardEntry => ({
  rank: item.rank,
  name: item.name,
  subtitle: `${item.role} · ${item.company_type}`,
  score: item.score,
  sessions: item.sessions,
  isYou: currentUserId === item.user_id,
  trend: "flat",
  source: "real",
  userId: item.user_id,
  role: item.role,
  companyType: item.company_type,
  previousScore: item.previous_score,
});

const sortEntries = (entries: InternalLeaderboardEntry[]) =>
  [...entries]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.sessions ?? 999) - (b.sessions ?? 999);
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

const mergeDemoAndRealEntries = (
  demoEntries: LeaderboardEntry[],
  realEntries: InternalLeaderboardEntry[]
): LeaderboardEntry[] => {
  const demoWithSource: InternalLeaderboardEntry[] = demoEntries.map((entry) => ({
    ...entry,
    source: "demo",
    isYou: false,
  }));

  const currentEntries = sortEntries([...demoWithSource, ...realEntries]);

  const previousRealEntries = realEntries.map((entry) => ({
    ...entry,
    score: entry.previousScore ?? entry.score,
    sessions: Math.max((entry.sessions ?? 1) - 1, 1),
  }));

  const previousEntries = sortEntries([...demoWithSource, ...previousRealEntries]);

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
      };
    }

    const rankDelta = previousEntry.rank - entry.rank;
    const deltaType =
      rankDelta > 0 ? "up" : rankDelta < 0 ? "down" : "neutral";

    return {
      ...entry,
      delta:
        rankDelta === 0
          ? "→ steady"
          : getRankChangeLabel(entry.rank, previousEntry.rank),
      deltaType,
      trend: deltaType === "neutral" ? "flat" : deltaType,
    };
  });
};

export default async function LeaderboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: userData } = await supabase.auth.getUser();

  const { data } = await supabase.rpc("get_leaderboard", {
    p_role: null,
    p_company_type: null,
  });

  const leaderboardRows = (data ?? []) as SupabaseLeaderboardRow[];

  const realEntries = leaderboardRows.map((item) =>
    toRealLeaderboardEntry(item, userData.user?.id)
  );

  const entries = mergeDemoAndRealEntries(FULL_LEADERBOARD, realEntries);

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="inner" />

      <div className="max-w-4xl mx-auto px-6 py-20">
        <h1 className="font-fustat font-extrabold text-[clamp(32px,4vw,48px)] tracking-[-1.5px] text-text">
          Leaderboard
        </h1>

        <p className="font-inter text-muted mt-2 mb-8">
          Ranked by composite score this week
        </p>

        <LeaderboardFilters />
        <LeaderboardTable entries={entries} />
      </div>
    </div>
  );
}
