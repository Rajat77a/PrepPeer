"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, LockKeyhole, Sparkles } from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { countWords } from "@/lib/utils";

const DEMO_QUESTIONS = [
  "Tell me about a difficult problem you solved and how you approached it.",
  "Describe a time you received critical feedback. What did you do next?",
  "Why are you interested in this role, and what would you contribute in your first 90 days?",
];

const scoreAnswer = (answer: string) => {
  const words = countWords(answer);
  const evidence = /\b(example|result|because|impact|learned|improved|measured)\b/i.test(answer);
  const structure = /\b(first|then|finally|situation|task|action|result)\b/i.test(answer);
  return Math.min(100, Math.round(Math.min(words, 90) * 0.72 + (evidence ? 18 : 0) + (structure ? 17 : 0)));
};

export default function DemoPage() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [finished, setFinished] = useState(false);
  const scores = useMemo(() => answers.map(scoreAnswer), [answers]);
  const overall = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  const weakest = scores.indexOf(Math.min(...scores)) + 1;

  const continueDemo = () => {
    if (!answers[current].trim()) return;
    if (current === DEMO_QUESTIONS.length - 1) {
      setFinished(true);
      return;
    }
    setCurrent((value) => value + 1);
  };

  return (
    <>
      <Navbar variant="inner" />
      <main id="main-content" className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_45%)] px-5 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          {!finished ? (
            <section className="rounded-[30px] border border-blue/15 bg-white p-6 shadow-[0_28px_90px_rgba(0,108,255,0.12)] sm:p-9">
              <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-inter text-xs font-bold uppercase tracking-[0.18em] text-blue">Free guided demo</p>
                  <h1 className="mt-2 font-inter text-3xl font-black tracking-[-0.04em] text-text sm:text-5xl">Try PrepPeer before signing up.</h1>
                </div>
                <div className="flex gap-3 font-inter text-xs font-semibold text-muted">
                  <span className="inline-flex items-center gap-1.5"><Clock3 size={14} /> 5 minutes</span>
                  <span className="inline-flex items-center gap-1.5"><LockKeyhole size={14} /> No account</span>
                </div>
              </div>

              <div className="mb-6" aria-label={`Question ${current + 1} of ${DEMO_QUESTIONS.length}`}>
                <div className="mb-2 flex justify-between font-inter text-xs font-bold text-muted">
                  <span>Question {current + 1} of {DEMO_QUESTIONS.length}</span>
                  <span>{Math.round(((current + 1) / DEMO_QUESTIONS.length) * 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-blue/10">
                  <div className="h-full rounded-full bg-blue transition-all" style={{ width: `${((current + 1) / DEMO_QUESTIONS.length) * 100}%` }} />
                </div>
              </div>

              <h2 className="font-inter text-2xl font-bold leading-snug text-text">{DEMO_QUESTIONS[current]}</h2>
              <label className="mt-6 block">
                <span className="mb-2 flex items-center gap-2 font-inter text-sm font-bold text-text">
                  Your answer <span className="required-badge">Required</span>
                </span>
                <textarea
                  required
                  aria-required="true"
                  value={answers[current]}
                  onChange={(event) => setAnswers((items) => items.map((item, index) => index === current ? event.target.value : item))}
                  rows={8}
                  maxLength={3000}
                  placeholder="Use a clear example, explain your actions, and finish with the result."
                  className="w-full rounded-2xl border border-black/15 bg-white p-5 font-inter text-base leading-7 text-text outline-none transition placeholder:text-slate-400 focus:border-blue focus:ring-4 focus:ring-blue/10"
                />
              </label>
              <div className="mt-3 flex flex-col gap-2 font-inter text-xs text-muted sm:flex-row sm:justify-between">
                <span>{countWords(answers[current])} words</span>
                <span>Tip: Situation → Action → Result</span>
              </div>
              <button
                type="button"
                disabled={!answers[current].trim()}
                onClick={continueDemo}
                className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-blue px-6 font-inter text-sm font-bold text-white shadow-[0_16px_38px_rgba(0,132,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0067d8] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {current === DEMO_QUESTIONS.length - 1 ? "See my demo feedback" : "Next question"}
                <ArrowRight size={17} />
              </button>
            </section>
          ) : (
            <section className="rounded-[30px] border border-blue/15 bg-white p-7 shadow-[0_28px_90px_rgba(0,108,255,0.12)] sm:p-10">
              <Sparkles className="text-blue" size={30} />
              <p className="mt-5 font-inter text-xs font-bold uppercase tracking-[0.18em] text-blue">Your demo snapshot</p>
              <h1 className="mt-2 font-inter text-4xl font-black tracking-[-0.05em] text-text sm:text-6xl">{overall}/100</h1>
              <p className="mt-4 max-w-2xl font-inter text-base leading-7 text-muted">
                Your answers show {overall >= 70 ? "strong early structure" : "a useful starting point"}. Question {weakest} is your clearest next practice opportunity. A full interview adds role-specific AI evaluation, peer ranking, dimension scores and saved progress.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {scores.map((score, index) => (
                  <div key={DEMO_QUESTIONS[index]} className="rounded-2xl border border-blue/12 bg-[#f7fbff] p-4">
                    <p className="font-inter text-xs font-bold text-muted">Question {index + 1}</p>
                    <p className="mt-1 font-inter text-2xl font-bold text-text">{score}</p>
                  </div>
                ))}
              </div>
              <div className="mt-7 rounded-2xl border border-green-200 bg-green-50 p-4 font-inter text-sm leading-6 text-green-900">
                <CheckCircle2 className="mr-2 inline" size={17} /> Your demo answers stay in this browser and are not added to the public leaderboard.
              </div>
              <Link href="/login?mode=signup&next=%2Fonboarding" className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-navy px-6 font-inter text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue">
                Create account and start the full interview <ArrowRight size={17} />
              </Link>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
