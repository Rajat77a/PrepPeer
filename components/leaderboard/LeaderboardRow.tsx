"use client";

import { motion } from "framer-motion";
import type { LeaderboardEntry } from "@/lib/types";
import { DeltaText } from "@/components/ui/DeltaText";
import { cn } from "@/lib/utils";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  compact?: boolean;
}

function RankCircle({ rank, isYou }: { rank: number; isYou?: boolean }) {
  if (rank === 1)
    return (
      <span className="w-[30px] h-[30px] rounded-full bg-gold text-[#412402] font-inter font-bold text-xs flex items-center justify-center shrink-0">
        #1
      </span>
    );
  if (rank === 2)
    return (
      <span className="w-[30px] h-[30px] rounded-full bg-[#C0C0C0] text-[#333] font-inter font-bold text-xs flex items-center justify-center shrink-0">
        #2
      </span>
    );
  if (isYou)
    return (
      <span className="w-[30px] h-[30px] rounded-full bg-blue text-white font-inter font-bold text-xs flex items-center justify-center shrink-0">
        #{rank}
      </span>
    );
  return (
    <span className="w-[30px] h-[30px] rounded-full bg-[#F1EFE8] text-[#5F5E5A] font-inter font-bold text-xs flex items-center justify-center shrink-0">
      #{rank}
    </span>
  );
}

export function LeaderboardRow({ entry, compact }: LeaderboardRowProps) {
  const barColor = entry.isYou
    ? "#0084FF"
    : entry.rank === 1
      ? "#FFBE3D"
      : "#9CA3AF";

  return (
    <motion.div
      whileHover={{
        x: 4,
        backgroundColor: "rgba(0,132,255,0.04)",
        transition: { duration: 0.2 },
      }}
      className={cn(
        "flex items-center gap-3.5 px-6 py-3.5 border-b border-[rgba(0,0,0,0.05)] transform-gpu",
        entry.isYou &&
          "bg-[rgba(0,132,255,0.06)] border-l-[3px] border-l-blue"
      )}
      style={{ willChange: "transform" }}
    >
      <RankCircle rank={entry.rank} isYou={entry.isYou} />
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-inter text-sm truncate",
            entry.isYou ? "font-bold text-[#0C447C]" : "text-text"
          )}
        >
          {entry.name}
        </p>
        {entry.subtitle && !compact && (
          <p className="font-inter text-xs text-muted">{entry.subtitle}</p>
        )}
      </div>
      {!compact && entry.sessions !== undefined && (
        <span className="font-inter text-sm text-muted w-16 text-center hidden md:block">
          {entry.sessions}
        </span>
      )}
      <div className="w-[90px] h-1.5 rounded-full bg-[#EEF2F7] overflow-hidden shrink-0">
        <div
          className="h-full rounded-full"
          style={{
            width: `${entry.score}%`,
            background: barColor,
          }}
        />
      </div>
      <span className="font-inter font-semibold text-sm text-text w-8 text-right">
        {entry.score}
      </span>
      {entry.delta && (
        <DeltaText type={entry.deltaType === "down" ? "down" : "up"}>
          {entry.delta}
        </DeltaText>
      )}
    </motion.div>
  );
}
