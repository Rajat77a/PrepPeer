"use client";

import { SessionScoreCard } from "@/components/results/SessionScoreCard";
import { QuestionBreakdownChart } from "@/components/results/QuestionBreakdownChart";
import { Navbar } from "@/components/ui/Navbar";
import { SESSION_REPORT } from "@/lib/mockData";

export default function ResultsPage() {
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
        <SessionScoreCard report={SESSION_REPORT} onShare={handleShare} />
        <QuestionBreakdownChart data={SESSION_REPORT.questionScores} />
      </div>
    </div>
  );
}
