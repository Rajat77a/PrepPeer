"use client";

import { useEffect, useState } from "react";
import { SessionScoreCard } from "@/components/results/SessionScoreCard";
import { QuestionBreakdownChart } from "@/components/results/QuestionBreakdownChart";
import { Navbar } from "@/components/ui/Navbar";
import { SESSION_REPORT } from "@/lib/mockData";
import type { SessionReport } from "@/lib/types";

export default function ResultsPage() {
  const [report, setReport] = useState<SessionReport>(SESSION_REPORT);

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

  return (
    <div className="min-h-screen bg-off-white">
      <Navbar variant="inner" />
      <div className="max-w-[900px] mx-auto px-6 py-20">
        <h1 className="font-fustat font-extrabold text-3xl text-text mb-2">
          Session Report
        </h1>
        <p className="font-inter text-muted mb-8">
          Your complete score card and per-question breakdown.
        </p>
        <SessionScoreCard report={report} onShare={handleShare} />
        <QuestionBreakdownChart data={report.questionScores} />
      </div>
    </div>
  );
}
