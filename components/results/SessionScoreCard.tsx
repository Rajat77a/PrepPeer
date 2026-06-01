"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, LockKeyhole, X } from "lucide-react";
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
  const [practiceGateOpen, setPracticeGateOpen] = useState(false);
  const isAccountResult = report.source === "account";
  const practiceHref = isAccountResult ? "/interview?mode=account" : "/interview";
  const leaderboardHref = isAccountResult ? "/dashboard/leaderboard" : "/leaderboard";
  const accountPracticePath = "%2Finterview%3Fmode%3Daccount";

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
          {rankLocked ? (
            <button
              type="button"
              onClick={() => setPracticeGateOpen(true)}
              className="flex-1 text-center py-2.5 rounded-[10px] bg-blue text-white font-inter font-semibold text-[13px] hover:scale-[1.02] transition-transform cursor-pointer"
            >
              Practice Again
            </button>
          ) : (
            <Link
              href={practiceHref}
              className="flex-1 text-center py-2.5 rounded-[10px] bg-blue text-white font-inter font-semibold text-[13px] hover:scale-[1.02] transition-transform cursor-pointer"
            >
              Practice Again
            </Link>
          )}
          <Link
            href={rankLocked ? "/login?next=%2Fresults%3FunlockRank%3D1" : leaderboardHref}
            target={rankLocked ? "_blank" : undefined}
            rel={rankLocked ? "noopener noreferrer" : undefined}
            className="flex-1 text-center py-2.5 rounded-[10px] border border-[rgba(0,0,0,0.08)] font-inter font-semibold text-[13px] hover:scale-[1.02] transition-transform cursor-pointer"
          >
            {rankLocked ? "Sign in to unlock" : "View Leaderboard"}
          </Link>
          {rankLocked ? (
            <Link
              href="/login?next=%2Fresults%3FunlockRank%3D1&mode=signup"
              target="_blank"
              rel="noopener noreferrer"
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
      {practiceGateOpen && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center bg-[#07111f]/55 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="practice-gate-title"
        >
          <div className="relative w-full max-w-[520px] overflow-hidden rounded-[28px] border border-[rgba(0,132,255,0.18)] bg-white shadow-[0_34px_90px_rgba(0,40,90,0.24)]">
            <div className="absolute right-[-80px] top-[-90px] h-60 w-60 rounded-full bg-[#0084ff]/15 blur-[55px]" />
            <div className="absolute bottom-[-120px] left-[-80px] h-64 w-64 rounded-full bg-[#7dffd9]/12 blur-[65px]" />
            <button
              type="button"
              onClick={() => setPracticeGateOpen(false)}
              className="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(0,0,0,0.08)] bg-white/80 text-muted transition hover:text-text"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="relative z-10 p-7 sm:p-8">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF5FF] shadow-[inset_0_0_0_1px_rgba(0,132,255,0.14)]">
                  <LockKeyhole size={24} className="text-blue" strokeWidth={2.1} />
                </div>
                <div>
                  <p className="font-inter text-[11px] font-extrabold uppercase tracking-[0.22em] text-blue">
                    Demo completed
                  </p>
                  <h2
                    id="practice-gate-title"
                    className="mt-1 font-fustat text-2xl font-extrabold tracking-[-0.04em] text-text"
                  >
                    Continue inside your account.
                  </h2>
                </div>
              </div>
              <p className="font-inter text-[15px] leading-7 text-muted">
                The free landing-page interview is a one-time preview. Sign in or
                create an account to start the next interview, save each session,
                and track your rank on the live board.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <Link
                  href={`/login?next=${accountPracticePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-blue px-5 py-3 font-inter text-sm font-extrabold text-white shadow-[0_18px_38px_rgba(0,132,255,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_48px_rgba(0,132,255,0.32)]"
                >
                  Sign in to continue
                  <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href={`/login?next=${accountPracticePath}&mode=signup`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-[rgba(0,132,255,0.18)] bg-[#F2F8FF] px-5 py-3 font-inter text-sm font-extrabold text-blue transition hover:-translate-y-0.5 hover:border-blue/35 hover:bg-white"
                >
                  Create account
                  <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
