import { LeaderboardRow } from "./LeaderboardRow";
import type { LeaderboardEntry } from "@/lib/types";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  return (
    <div className="rounded-[20px] overflow-hidden border border-[rgba(0,132,255,0.12)]">
      <div className="bg-navy px-6 py-4 grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center">
        <span className="font-fustat font-bold text-sm text-white w-16">Rank</span>
        <span className="font-fustat font-bold text-sm text-white">Candidate</span>
        <span className="font-fustat font-bold text-sm text-white w-20 text-center hidden md:block">
          Sessions
        </span>
        <span className="font-fustat font-bold text-sm text-white w-24">Score</span>
        <span className="font-fustat font-bold text-sm text-white w-16 hidden sm:block">
          Trend
        </span>
        <span className="font-fustat font-bold text-sm text-white w-24">Movement</span>
      </div>

      {entries.map((entry, i) => (
        <div
          key={`${entry.source ?? "demo"}-${entry.rank}-${entry.name}`}
          className={i % 2 === 1 && !entry.isYou ? "bg-[#FAFAFA]" : ""}
        >
          <LeaderboardRow entry={entry} />
        </div>
      ))}
    </div>
  );
}
