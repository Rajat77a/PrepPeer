"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpenText, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { SessionScoreCard } from "@/components/results/SessionScoreCard";
import { QuestionBreakdownChart } from "@/components/results/QuestionBreakdownChart";
import { SessionSummary } from "@/components/results/SessionSummary";
import { Navbar } from "@/components/ui/Navbar";
import { SESSION_REPORT } from "@/lib/mockData";
import type { SessionReport } from "@/lib/types";

export default function ResultsPage() {
  const [report, setReport] = useState<SessionReport>(SESSION_REPORT);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("preppeer_results");

      if (stored) {
        const realData = JSON.parse(stored);

        setReport((prev) => ({
          ...prev,
          compositeScore: realData.compositeScore ?? prev.compositeScore,
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

  const handleSummaryJump = () => {
    summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const summaryPreview =
    report.summary?.overallSummary ??
    "Open the session brief to see the final review, priority fixes, and question-by-question notes.";

  return (
    <div className="min-h-screen bg-off-white">
      <Navbar variant="inner" />

      <div className="max-w-[900px] mx-auto px-6 py-20">
        <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h1 className="font-fustat font-extrabold text-3xl text-text mb-2">
              Session Report
            </h1>

            <p className="font-inter text-muted">
              Your complete score card, per-question breakdown, and final session brief.
            </p>
          </div>

          <motion.button
            type="button"
            onClick={handleSummaryJump}
            className="group relative overflow-hidden rounded-2xl border border-[rgba(0,132,255,0.16)] bg-white p-4 text-left shadow-[0_18px_42px_rgba(0,132,255,0.09)]"
            whileHover={{
              y: -4,
              rotateX: 3,
              rotateY: -4,
              boxShadow: "0 24px 56px rgba(0,132,255,0.16)",
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[rgba(0,132,255,0.16)] to-transparent transition-transform duration-500 group-hover:translate-x-4" />
            <div className="relative flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(0,132,255,0.08)] text-blue">
                <BookOpenText size={20} strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-inter text-[11px] font-bold uppercase tracking-[0.18em] text-blue">
                  Session brief
                </p>
                <p className="mt-1 line-clamp-2 font-inter text-sm leading-6 text-text">
                  {summaryPreview}
                </p>
              </div>
              <ChevronRight
                size={18}
                className="mt-2 shrink-0 text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue"
              />
            </div>
          </motion.button>
        </div>

        <SessionScoreCard report={report} onShare={handleShare} />
        <QuestionBreakdownChart data={report.questionScores} />
        <div ref={summaryRef} id="session-summary" className="scroll-mt-24">
          <SessionSummary summary={report.summary} />
        </div>
      </div>
    </div>
  );
}
