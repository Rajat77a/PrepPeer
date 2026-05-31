"use client";

import { useEffect, useRef, useState } from "react";
import type { TouchEvent, WheelEvent } from "react";
import { BookOpenText, ChevronRight, ListChecks, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SessionScoreCard } from "@/components/results/SessionScoreCard";
import { QuestionBreakdownChart } from "@/components/results/QuestionBreakdownChart";
import { SessionSummary } from "@/components/results/SessionSummary";
import { Navbar } from "@/components/ui/Navbar";
import { SESSION_REPORT } from "@/lib/mockData";
import type { SessionReport } from "@/lib/types";

export default function ResultsPage() {
  const [report, setReport] = useState<SessionReport>(SESSION_REPORT);
  const [briefOpen, setBriefOpen] = useState(false);
  const reviewScrollRef = useRef<HTMLDivElement>(null);
  const lastTouchYRef = useRef<number | null>(null);
  const targetScrollTopRef = useRef(0);
  const scrollFrameRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("preppeer_results");

      if (stored) {
        const realData = JSON.parse(stored);

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
      }
    } catch {
      // fallback to mock
    }
  }, []);

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

        <SessionScoreCard report={report} onShare={handleShare} />
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
