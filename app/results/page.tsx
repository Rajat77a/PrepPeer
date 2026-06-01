"use client";

import { useEffect, useRef, useState } from "react";
import type { TouchEvent, WheelEvent } from "react";
import Link from "next/link";
import { BookOpenText, ChevronRight, ListChecks, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SessionScoreCard } from "@/components/results/SessionScoreCard";
import { QuestionBreakdownChart } from "@/components/results/QuestionBreakdownChart";
import { SessionSummary } from "@/components/results/SessionSummary";
import { Navbar } from "@/components/ui/Navbar";
import { SESSION_REPORT } from "@/lib/mockData";
import type { SessionReport } from "@/lib/types";
import {
  getDisplayName,
  getRankPercentileLabel,
  getRankSummary,
  type InterviewSessionRow,
} from "@/lib/ranking";
import { createClient } from "@/utils/supabase/client";

type StoredResult = Partial<SessionReport> & {
  source?: "account" | "demo";
  unlockedUserId?: string;
  unlockedSessionId?: string;
};

const DEMO_RESULTS_KEY = "preppeer_pending_demo_results";
const RESULTS_KEY = "preppeer_results";

export default function ResultsPage() {
  const [report, setReport] = useState<SessionReport>(SESSION_REPORT);
  const [rankLocked, setRankLocked] = useState(false);
  const [missingUnlockResult, setMissingUnlockResult] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const reviewScrollRef = useRef<HTMLDivElement>(null);
  const unlockInFlightRef = useRef(false);
  const lastTouchYRef = useRef<number | null>(null);
  const targetScrollTopRef = useRef(0);
  const scrollFrameRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const stored =
        sessionStorage.getItem(RESULTS_KEY) ?? localStorage.getItem(DEMO_RESULTS_KEY);
      const shouldUnlockRank =
        new URLSearchParams(window.location.search).get("unlockRank") === "1";

      if (stored) {
        sessionStorage.setItem(RESULTS_KEY, stored);
        const realData = JSON.parse(stored) as StoredResult;
        const shouldLockRank =
          (realData.source === "demo" && !realData.unlockedUserId) ||
          (!realData.unlockedUserId &&
            (!realData.currentRank || !realData.totalCandidates));

        setReport((prev) => ({
          ...prev,
          name: realData.name ?? prev.name,
          role: realData.role ?? prev.role,
          companyType: realData.companyType ?? prev.companyType,
          compositeScore: realData.compositeScore ?? prev.compositeScore,
          percentile: realData.percentile ?? "Not ranked",
          rankDelta: realData.rankDelta ?? "No ranked session yet",
          previousRank: realData.previousRank ?? 0,
          currentRank: realData.currentRank ?? 0,
          totalCandidates: realData.totalCandidates ?? 0,
          dimensions: realData.dimensions ?? prev.dimensions,
          questionScores: realData.questionScores ?? prev.questionScores,
          summary: realData.summary ?? prev.summary,
        }));
        setRankLocked(shouldLockRank);
      } else if (shouldUnlockRank) {
        setMissingUnlockResult(true);
      }
    } catch {
      setMissingUnlockResult(true);
    }
  }, []);

  useEffect(() => {
    if (!rankLocked) return;
    const shouldUnlockRank =
      new URLSearchParams(window.location.search).get("unlockRank") === "1";

    if (!shouldUnlockRank) return;

    const unlockStoredRank = async () => {
      if (unlockInFlightRef.current) return;
      unlockInFlightRef.current = true;

      try {
        const stored =
          sessionStorage.getItem(RESULTS_KEY) ?? localStorage.getItem(DEMO_RESULTS_KEY);
        if (!stored) return;

        const storedResult = JSON.parse(stored) as StoredResult;
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || storedResult.unlockedUserId === user.id) return;

        const { data: insertedSession, error: insertError } = await supabase
          .from("interview_sessions")
          .insert({
            user_id: user.id,
            role: storedResult.role ?? "Interview",
            experience: null,
            company_type: storedResult.companyType ?? "General",
            composite_score: storedResult.compositeScore ?? 0,
            dimensions: storedResult.dimensions ?? [],
            question_scores: storedResult.questionScores ?? [],
            summary: storedResult.summary ?? null,
          })
          .select("id")
          .single();

        if (insertError) return;

        const { data: sessionRows } = await supabase
          .from("interview_sessions")
          .select(
            "id,user_id,role,experience,company_type,composite_score,dimensions,question_scores,summary,created_at"
          )
          .order("created_at", { ascending: false })
          .limit(1000);

        const rankSummary = getRankSummary(
          (sessionRows ?? []) as InterviewSessionRow[],
          user.id
        );

        if (!rankSummary) return;

        const unlockedResult: StoredResult = {
          ...storedResult,
          name: getDisplayName(user.user_metadata, user.email),
          role: storedResult.role ?? "Interview",
          companyType: storedResult.companyType ?? "General",
          source: "account",
          unlockedUserId: user.id,
          unlockedSessionId: insertedSession?.id,
          percentile: getRankPercentileLabel(
            rankSummary.rank,
            rankSummary.totalCandidates
          ),
          rankDelta: rankSummary.rankChange,
          previousRank: rankSummary.previousRank ?? 0,
          currentRank: rankSummary.rank,
          totalCandidates: rankSummary.totalCandidates,
        };

        sessionStorage.setItem(RESULTS_KEY, JSON.stringify(unlockedResult));
        localStorage.removeItem(DEMO_RESULTS_KEY);
        setReport((prev) => ({
          ...prev,
          name: unlockedResult.name ?? prev.name,
          role: unlockedResult.role ?? prev.role,
          companyType: unlockedResult.companyType ?? prev.companyType,
          compositeScore: unlockedResult.compositeScore ?? prev.compositeScore,
          percentile: unlockedResult.percentile ?? prev.percentile,
          rankDelta: unlockedResult.rankDelta ?? prev.rankDelta,
          previousRank: unlockedResult.previousRank ?? prev.previousRank,
          currentRank: unlockedResult.currentRank ?? prev.currentRank,
          totalCandidates: unlockedResult.totalCandidates ?? prev.totalCandidates,
          dimensions: unlockedResult.dimensions ?? prev.dimensions,
          questionScores: unlockedResult.questionScores ?? prev.questionScores,
          summary: unlockedResult.summary ?? prev.summary,
        }));
        setRankLocked(false);
      } catch {
        // Keep the rank locked if the unlock attempt cannot complete.
      } finally {
        unlockInFlightRef.current = false;
      }
    };

    void unlockStoredRank();
  }, [rankLocked]);

  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? window.location.href
        : "https://preppeer.app/results";

    try {
      await navigator.clipboard.writeText(url);
      alert("Score card link copied to clipboard!");
    } catch {
      alert("Could not copy link. Please copy manually.");
    }
  };

  const summaryPreview =
    report.summary?.overallSummary ??
    "Review the final assessment, priority improvements, and question-by-question notes.";

  const animateReviewScroll = () => {
    const scroller = reviewScrollRef.current;
    if (!scroller || scroller.scrollHeight <= scroller.clientHeight) return;

    const distance = targetScrollTopRef.current - scroller.scrollTop;

    if (Math.abs(distance) < 0.25) {
      scroller.scrollTop = targetScrollTopRef.current;
      scrollFrameRef.current = null;
      return;
    }

    scroller.scrollTop += distance * 0.095;
    scrollFrameRef.current = window.requestAnimationFrame(animateReviewScroll);
  };

  const scrollReviewPanel = (amount: number) => {
    const scroller = reviewScrollRef.current;
    if (!scroller || scroller.scrollHeight <= scroller.clientHeight) return;

    const maxScrollTop = scroller.scrollHeight - scroller.clientHeight;
    targetScrollTopRef.current = Math.min(
      maxScrollTop,
      Math.max(0, targetScrollTopRef.current + amount)
    );

    if (scrollFrameRef.current === null) {
      scrollFrameRef.current = window.requestAnimationFrame(animateReviewScroll);
    }
  };

  const handleReviewWheel = (event: WheelEvent<HTMLDivElement>) => {
    const scroller = reviewScrollRef.current;
    if (!scroller || scroller.scrollHeight <= scroller.clientHeight) return;

    event.preventDefault();
    scrollReviewPanel(event.deltaY * 0.72);
  };

  const handleReviewTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    lastTouchYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleReviewTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const currentY = event.touches[0]?.clientY;
    if (currentY === undefined || lastTouchYRef.current === null) return;

    event.preventDefault();
    scrollReviewPanel((lastTouchYRef.current - currentY) * 0.82);
    lastTouchYRef.current = currentY;
  };

  useEffect(() => {
    if (!briefOpen) return;

    const scrollY = window.scrollY;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalBodyTop = document.body.style.top;
    const originalBodyWidth = document.body.style.width;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    targetScrollTopRef.current = 0;

    return () => {
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }

      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.position = originalBodyPosition;
      document.body.style.top = originalBodyTop;
      document.body.style.width = originalBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [briefOpen]);

  if (missingUnlockResult) {
    return (
      <div className="min-h-screen bg-off-white">
        <Navbar variant="inner" />
        <div className="mx-auto flex min-h-[calc(100vh-84px)] max-w-[760px] items-center px-6 py-20">
          <div className="w-full rounded-[28px] border border-[rgba(0,132,255,0.16)] bg-white p-8 shadow-[0_24px_70px_rgba(0,132,255,0.1)]">
            <p className="font-inter text-[11px] font-bold uppercase tracking-[0.22em] text-blue">
              Demo result not found
            </p>
            <h1 className="mt-3 font-fustat text-3xl font-extrabold tracking-[-0.04em] text-text sm:text-4xl">
              Your saved demo score was not available in this tab.
            </h1>
            <p className="mt-4 max-w-[560px] font-inter text-base leading-7 text-muted">
              Start an interview from your account dashboard to get a ranked
              result connected to your profile and the live leaderboard.
            </p>
            <Link
              href="/dashboard"
              className="mt-7 inline-flex rounded-2xl bg-blue px-6 py-3 font-inter text-sm font-extrabold text-white shadow-[0_16px_34px_rgba(0,132,255,0.24)] transition hover:-translate-y-0.5"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white">
      <Navbar variant="inner" />

      <div className="max-w-[900px] mx-auto px-6 py-20">
        <div className="mb-8">
          <div>
            <h1 className="font-fustat font-extrabold text-3xl text-text mb-2">
              Session Report
            </h1>

            <p className="font-inter text-muted">
              Your complete score card, per-question breakdown, and session review.
            </p>
          </div>

          <motion.button
            type="button"
            onClick={() => setBriefOpen(true)}
            className="group relative mt-6 w-full overflow-hidden rounded-[24px] border border-[rgba(0,132,255,0.14)] bg-white text-left shadow-[0_22px_60px_rgba(0,132,255,0.09)]"
            whileHover={{
              y: -4,
              rotateX: 3,
              boxShadow: "0 28px 70px rgba(0,132,255,0.16)",
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="absolute inset-y-0 right-0 w-56 bg-gradient-to-l from-[rgba(0,132,255,0.14)] to-transparent transition-transform duration-500 group-hover:translate-x-8" />
            <div className="relative grid gap-5 p-5 sm:grid-cols-[140px_1fr_auto] sm:items-center">
              <div className="relative hidden h-[116px] sm:block">
                <div className="absolute left-8 top-5 h-20 w-24 rotate-[-10deg] rounded-2xl border border-[rgba(0,132,255,0.12)] bg-[#EAF5FF]" />
                <div className="absolute left-12 top-3 h-24 w-28 rotate-[7deg] rounded-2xl border border-[rgba(0,200,150,0.14)] bg-[#ECFFF9]" />
                <div className="absolute left-5 top-0 flex h-28 w-28 items-center justify-center rounded-2xl border border-[rgba(0,132,255,0.16)] bg-white shadow-[0_18px_42px_rgba(0,132,255,0.12)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-[-3deg]">
                  <BookOpenText size={32} className="text-blue" strokeWidth={1.8} />
                </div>
              </div>

              <div className="min-w-0">
                <p className="font-inter text-[11px] font-bold uppercase tracking-[0.22em] text-blue">
                  Session review
                </p>
                <h2 className="mt-2 font-fustat text-2xl font-extrabold text-text">
                  Review the key takeaways.
                </h2>
                <p className="mt-2 line-clamp-2 font-inter text-sm leading-6 text-muted">
                  {summaryPreview}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-inter text-xs font-semibold text-text">
                  <span className="inline-flex items-center gap-2">
                    <ListChecks size={14} className="text-green" />
                    Priority fixes
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <BookOpenText size={14} className="text-blue" />
                    Question notes
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-navy px-4 py-3 text-white sm:min-w-[150px] sm:justify-center">
                <span className="font-inter text-sm font-extrabold">Open Review</span>
                <ChevronRight
                  size={18}
                  className="ml-3 transition-transform duration-300 group-hover:translate-x-1"
                />
              </div>
            </div>
          </motion.button>
        </div>

        <SessionScoreCard
          report={report}
          onShare={handleShare}
          rankLocked={rankLocked}
        />
        <QuestionBreakdownChart data={report.questionScores} />
      </div>

      <AnimatePresence>
        {briefOpen && (
          <motion.div
            className="fixed inset-0 z-[300] overflow-hidden bg-[rgba(10,10,15,0.42)] px-4 py-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onWheelCapture={handleReviewWheel}
            onTouchStart={handleReviewTouchStart}
            onTouchMove={handleReviewTouchMove}
            onTouchEnd={() => {
              lastTouchYRef.current = null;
            }}
          >
            <motion.aside
              className="ml-auto flex h-[calc(100vh-48px)] max-h-[calc(100vh-48px)] min-h-0 w-full max-w-[720px] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_32px_90px_rgba(0,0,0,0.24)]"
              initial={{ opacity: 0, x: 80, rotateY: -8 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              exit={{ opacity: 0, x: 80, rotateY: -8 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[rgba(0,0,0,0.08)] bg-[#FAFBFD] p-5">
                <div>
                  <p className="font-inter text-[11px] font-bold uppercase tracking-[0.22em] text-blue">
                    Session review
                  </p>
                  <h2 className="mt-1 font-fustat text-2xl font-extrabold text-text">
                    Key takeaways
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setBriefOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(0,0,0,0.08)] bg-white text-muted transition hover:text-text"
                  aria-label="Close session brief"
                >
                  <X size={18} />
                </button>
              </div>

              <div
                ref={reviewScrollRef}
                className="min-h-0 flex-1 overflow-y-scroll overscroll-contain p-5"
                style={{
                  WebkitOverflowScrolling: "touch",
                  scrollbarGutter: "stable",
                  touchAction: "none",
                }}
              >
                {report.summary ? (
                  <SessionSummary summary={report.summary} />
                ) : (
                  <div className="rounded-2xl border border-[rgba(0,132,255,0.14)] bg-[rgba(0,132,255,0.05)] p-5">
                    <p className="font-inter text-sm leading-6 text-muted">
                      The session review will appear here after your interview results are saved.
                    </p>
                  </div>
                )}

              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
