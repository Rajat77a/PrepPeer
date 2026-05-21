import type { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { LeaderboardFilters } from "@/components/leaderboard/LeaderboardFilters";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "See where you rank among SDE freshers and other roles — updated in real time.",
};

export default function LeaderboardPage() {
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
        <LeaderboardTable />
      </div>
    </div>
  );
}
