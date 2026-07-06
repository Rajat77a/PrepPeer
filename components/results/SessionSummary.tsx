"use client";

import type { AISessionSummary, QuestionReviewStatus } from "@/lib/types";

interface SessionSummaryProps {
  summary?: AISessionSummary;
}

const statusLabel: Record<QuestionReviewStatus, string> = {
  answered: "Answered",
  ai: "AI detected",
  gibberish: "Invalid answer",
  skipped: "Skipped",
  autoSkipped: "Unattempted",
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

      {(summary.strongestPart || summary.weakestPart) && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {summary.strongestPart && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
              <p className="font-inter text-[11px] font-bold uppercase tracking-[0.16em] text-green-700">
                Strongest part
              </p>
              <p className="mt-2 font-inter text-sm font-semibold leading-6 text-green-900">
                {summary.strongestPart}
              </p>
            </div>
          )}

          {summary.weakestPart && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="font-inter text-[11px] font-bold uppercase tracking-[0.16em] text-red-700">
                Weakest part
              </p>
              <p className="mt-2 font-inter text-sm font-semibold leading-6 text-red-900">
                {summary.weakestPart}
              </p>
            </div>
          )}
        </div>
      )}

      {summary.keyTakeaways?.length ? (
        <div className="mt-5">
          <p className="font-inter text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
            Final key takeaways
          </p>

          <ul className="mt-3 space-y-3">
            {summary.keyTakeaways.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-inter text-sm leading-6 text-blue-950"
              >
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-5">
        <p className="font-inter text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
          What needs improvement
        </p>

        <ul className="mt-3 space-y-3">
          {summary.needsImprovement.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 font-inter text-sm leading-6 text-orange-900"
            >
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 space-y-4">
        {summary.questionReviews.map((item) => (
          <div
            key={item.question}
            className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#FAFBFD] p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-inter text-sm font-bold text-text">
                {item.question}: {statusLabel[item.status]}
              </p>

              <p className="font-inter text-sm font-extrabold tabular-nums text-text">
                {item.score}/40
              </p>
            </div>

            {item.summary && (
              <p className="mt-3 font-inter text-sm leading-6 text-muted">
                {item.summary}
              </p>
            )}

            {item.prompt && (
              <p className="mt-3 rounded-lg bg-white px-3 py-2 font-inter text-xs leading-5 text-muted">
                Question: {item.prompt}
              </p>
            )}

            {(item.status === "skipped" || item.status === "autoSkipped") && (
              <p className="mt-2 font-inter text-sm leading-6 text-text">
                This question was not evaluated, but the model answer below is included for practice.
              </p>
            )}

            {item.modelAnswer && (
              <div className="mt-3 rounded-xl border border-[rgba(0,132,255,0.14)] bg-white p-4">
                <p className="font-inter text-[11px] font-bold uppercase tracking-[0.16em] text-blue">
                  Model answer
                </p>
                <p className="mt-2 font-inter text-sm leading-6 text-text">
                  {item.modelAnswer}
                </p>
              </div>
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
