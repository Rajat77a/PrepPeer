"use client";

import Link from "next/link";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { DeltaText } from "@/components/ui/DeltaText";
import type { SessionReport } from "@/lib/types";

interface SessionScoreCardProps {
  report: SessionReport;
  onShare?: () => void;
}

export function SessionScoreCard({ report, onShare }: SessionScoreCardProps) {
  return (
    <div className="rounded-3xl overflow-hidden border border-[rgba(0,132,255,0.15)] shadow-[0_32px_80px_rgba(0,0,0,0.08)] bg-white">
      <div
        className="px-7 pt-7 pb-9"
        style={{
          background: "linear-gradient(135deg, #1B2B5E 0%, #2255A4 100%)",
        }}
      >
        <p className="font-inter text-[13px] text-white/60 mb-1.5">
          {report.role} · {report.companyType}
        </p>
        <h1 className="font-fustat font-extrabold text-[22px] text-white mb-5">
          {report.name}
        </h1>
        <div className="flex items-center gap-5 flex-wrap">
          <div
            className="relative w-[88px] h-[88px] rounded-full flex items-center justify-center shrink-0"
            style={{
              background: `conic-gradient(#60B1FF 0%, #0084FF ${report.compositeScore}%, rgba(255,255,255,0.15) ${report.compositeScore}%)`,
              boxShadow: "0 0 0 3px rgba(255,255,255,0.2)",
            }}
          >
            <div className="w-[70px] h-[70px] rounded-full bg-navy flex flex-col items-center justify-center">
              <span className="font-fustat font-extrabold text-[22px] text-white leading-none">
                {report.compositeScore}
              </span>
              <span className="font-inter text-[10px] text-white/50">/100</span>
            </div>
          </div>
          <div>
            <p className="font-fustat font-extrabold text-[28px] text-white">
              {report.percentile}
            </p>
            <p className="font-inter text-[13px] text-white/65">
              of {report.totalCandidates} SDE freshers
            </p>
            <p className="mt-2">
              <DeltaText size="xs" type="light">
                {report.rankDelta}
              </DeltaText>
            </p>
          </div>
        </div>
      </div>
      <div className="px-7 py-6 space-y-4">
        {report.dimensions.map((d) => (
          <ScoreBar
            key={d.label}
            label={d.label}
            value={d.value}
            color={d.color}
            labelWidth="130px"
            barHeight={7}
          />
        ))}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Link
            href="/interview"
            className="flex-1 text-center py-2.5 rounded-[10px] bg-blue text-white font-inter font-semibold text-[13px] hover:scale-[1.02] transition-transform cursor-pointer"
          >
            Practice Again
          </Link>
          <Link
            href="/leaderboard"
            className="flex-1 text-center py-2.5 rounded-[10px] border border-[rgba(0,0,0,0.08)] font-inter font-semibold text-[13px] hover:scale-[1.02] transition-transform cursor-pointer"
          >
            View Leaderboard
          </Link>
          <button
            type="button"
            onClick={onShare}
            className="flex-1 py-2.5 rounded-[10px] border border-[rgba(0,0,0,0.08)] font-inter font-semibold text-[13px] hover:scale-[1.02] transition-transform cursor-pointer"
          >
            Share Score
          </button>
        </div>
      </div>
    </div>
  );
}
