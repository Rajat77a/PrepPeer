"use client";

import { useState } from "react";

const choices = ["Clear", "Somewhat confusing", "Very confusing"] as const;

export function ResultsFeedback() {
  const [choice, setChoice] = useState<string | null>(null);

  const record = (value: string) => {
    setChoice(value);
    try {
      window.localStorage.setItem("preppeer_results_feedback", value);
    } catch {
      // Feedback remains acknowledged even when browser storage is unavailable.
    }
  };

  return (
    <section className="mt-8 rounded-3xl border border-blue/15 bg-white p-6 shadow-[0_18px_55px_rgba(0,108,255,0.08)]" aria-labelledby="results-feedback-title">
      <p id="results-feedback-title" className="font-instrument text-lg font-bold text-text">Was anything in this report confusing?</p>
      <p className="mt-1 font-inter text-sm text-muted">One tap helps us improve the next version.</p>
      {choice ? (
        <p role="status" className="mt-4 font-inter text-sm font-bold text-green-700">Thanks—your feedback was recorded on this device.</p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {choices.map((item) => <button key={item} type="button" onClick={() => record(item)} className="min-h-11 rounded-full border border-blue/15 bg-[#f7fbff] px-4 font-instrument text-sm font-bold text-text transition hover:border-blue/40 hover:text-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue">{item}</button>)}
        </div>
      )}
    </section>
  );
}
