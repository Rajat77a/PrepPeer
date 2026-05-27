"use client";

import type { AISessionSummary, QuestionReviewStatus } from "@/lib/types";

interface SessionSummaryProps {
  summary?: AISessionSummary;
}

const statusLabel: Record<QuestionReviewStatus, string> = {
  answered: "Answered",
  ai: "AI detected",
  gibberish: "Invalid answer",
  autoSkipped: "Auto-submitted",
};

export function SessionSummary({ summary }: SessionSummaryProps) {
  if (!summary) return null;

  return (
    <section className="mt-6 rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white p-6">
      <h2 className="font-fustat text-xl font-extrabold text-text">
        Final Summary
      </h2>

      <p className="mt-3 font-inter text-sm leading-6 text-muted">
        {summary.overallSummary}
      </p>

      <div className="mt-5">
        <p className="font-inter text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
          What needs improvement
        </p>
        <ul className="mt-3 space-y-2">
          {summary.needsImprovement.map((item) => (
            <li key={item} className="font-inter text-sm text-text">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 space-y-4">
        {summary.questionReviews.map((item) => (
          <div key={item.question} className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#FAFBFD] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-inter text-sm font-bold text-text">
                {item.question}: {statusLabel[item.status]}
              </p>
              <p className="font-inter text-sm font-extrabold tabular-nums text-text">
                {item.score}/100
              </p>
            </div>

            {item.summary && (
              <p className="mt-3 font-inter text-sm leading-6 text-muted">
                {item.summary}
              </p>
            )}

            {item.improvement && (
              <p className="mt-2 font-inter text-sm leading-6 text-text">
                Improve: {item.improvement}
              </p>
            )}

            {item.reason && (
              <p className="mt-2 font-inter text-xs leading-5 text-muted">
                Reason: {item.reason}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
