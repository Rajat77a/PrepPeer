"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { ScoreBar } from "@/components/ui/ScoreBar";
import { DeltaText } from "@/components/ui/DeltaText";
import type { SessionReport } from "@/lib/types";

interface SessionScoreCardProps {
  report: SessionReport;
  onShare?: () => void;
  rankLocked?: boolean;
}

export function SessionScoreCard({
  report,
  onShare,
  rankLocked = false,
}: SessionScoreCardProps) {
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
            {rankLocked ? (
              <div className="select-none">
                <div
                  className="relative mb-3 h-[34px] w-[186px] overflow-hidden rounded-full border border-white/18 bg-white/10"
                  aria-hidden="true"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08),rgba(255,255,255,0.28),rgba(255,255,255,0.08))] blur-[6px]" />
                  <div className="absolute left-4 top-1/2 h-3 w-24 -translate-y-1/2 rounded-full bg-white/35 blur-[3px]" />
                  <div className="absolute right-4 top-1/2 h-3 w-9 -translate-y-1/2 rounded-full bg-[#7DFFD9]/45 blur-[3px]" />
                </div>
                <p className="flex items-center gap-2 font-inter text-[13px] font-bold text-white/78">
                  <LockKeyhole size={14} />
                  Rank locked for demo mode
                </p>
                <p className="mt-2 max-w-[260px] font-inter text-[12px] leading-5 text-white/58">
                  Sign in or create an account to place this score on the live board.
                </p>
              </div>
            ) : (
              <>
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
              </>
            )}
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
            href={rankLocked ? "/login?next=%2Fresults%3FunlockRank%3D1" : "/leaderboard"}
            className="flex-1 text-center py-2.5 rounded-[10px] border border-[rgba(0,0,0,0.08)] font-inter font-semibold text-[13px] hover:scale-[1.02] transition-transform cursor-pointer"
          >
            {rankLocked ? "Sign in to unlock" : "View Leaderboard"}
          </Link>
          {rankLocked ? (
            <Link
              href="/login?next=%2Fresults%3FunlockRank%3D1&mode=signup"
              className="flex-1 text-center py-2.5 rounded-[10px] border border-[rgba(0,132,255,0.18)] bg-[rgba(0,132,255,0.06)] font-inter font-semibold text-[13px] text-blue hover:scale-[1.02] transition-transform cursor-pointer"
            >
              Create account
            </Link>
          ) : (
            <button
              type="button"
              onClick={onShare}
              className="flex-1 py-2.5 rounded-[10px] border border-[rgba(0,0,0,0.08)] font-inter font-semibold text-[13px] hover:scale-[1.02] transition-transform cursor-pointer"
            >
              Share Score
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
