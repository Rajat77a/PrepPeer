import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Navbar } from "@/components/ui/Navbar";
import { LeaderboardFilters } from "@/components/leaderboard/LeaderboardFilters";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { createClient } from "@/utils/supabase/server";
import { FULL_LEADERBOARD } from "@/lib/mockData";
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
};

const toRealLeaderboardEntry = (
  item: SupabaseLeaderboardRow,
  currentUserId?: string
): LeaderboardEntry => {
  const delta = item.rank_delta ?? 0;

  return {
    rank: item.rank,
    name: item.name,
    subtitle: `${item.role} · ${item.company_type}`,
    score: item.score,
    sessions: item.sessions,
    delta:
      item.previous_rank === null
        ? "New"
        : delta > 0
          ? `↑ +${delta}`
          : delta < 0
            ? `↓ ${Math.abs(delta)}`
            : undefined,
    deltaType:
      item.previous_rank === null || delta > 0
        ? "up"
        : delta < 0
          ? "down"
          : undefined,
    isYou: currentUserId === item.user_id,
    trend: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
    source: "real",
  };
};

const mergeDemoAndRealEntries = (
  demoEntries: LeaderboardEntry[],
  realEntries: LeaderboardEntry[]
): LeaderboardEntry[] => {
  const demoWithSource = demoEntries.map((entry) => ({
    ...entry,
    source: "demo" as const,
    isYou: false,
  }));

  return [...demoWithSource, ...realEntries]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (a.sessions ?? 999) - (b.sessions ?? 999);
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
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

  const realEntries = leaderboardRows.map((item: SupabaseLeaderboardRow) =>
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
