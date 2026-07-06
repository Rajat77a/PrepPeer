"use client";

import { Button } from "@/components/ui/Button";
import { countWords } from "@/lib/utils";
import { motion } from "framer-motion";

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  question?: string;
  answer: string;
  evaluationError?: string;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  onAnswerChange: (answer: string) => void;
  onSubmit: (answer: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
  onComplete: () => void;
  onQuit: () => void;
  antiCheatProps?: {
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    onContextMenu: (e: React.MouseEvent<HTMLTextAreaElement>) => void;
    onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
    onCopy: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
    onCut: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  };
}

export function QuestionCard({
  questionNumber,
  totalQuestions,
  question,
  answer,
  evaluationError,
  canGoPrevious = false,
  canGoNext = false,
  onAnswerChange,
  onSubmit,
  onPrevious,
  onNext,
  onSkip,
  onComplete,
  onQuit,
  antiCheatProps,
}: QuestionCardProps) {
  const wordCount = countWords(answer);
  const canSubmit = answer.trim().length > 0;
  const blockPromptSelection = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    window.getSelection()?.removeAllRanges();
  };

  return (
    <motion.section
      className="overflow-hidden border border-[rgba(0,0,0,0.08)] bg-white shadow-[0_18px_60px_rgba(10,10,15,0.08)]"
      style={{ borderRadius: 20 }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="p-6 sm:p-7">
        <div className="mb-6">
          <p className="font-inter text-[11px] font-bold uppercase tracking-[0.12em] text-muted mb-1">
            Question {questionNumber} of {totalQuestions}
          </p>
          <motion.h2
            className="font-fustat text-[24px] font-extrabold leading-[1.35] text-text"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.06, ease: "easeOut" }}
          >
            {question ?? "Loading question..."}
          </motion.h2>
        </div>

        <div className="relative">
          <textarea
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Write your answer here. Use examples, tradeoffs, and clear reasoning."
            maxLength={8000}
            className="w-full min-h-[240px] resize-y border border-[rgba(0,0,0,0.12)] bg-white p-5 font-inter text-[15px] leading-7 text-text outline-none transition focus:border-[#0084FF] focus:shadow-[0_0_0_3px_rgba(0,132,255,0.11)]"
            style={{ borderRadius: 16 }}
            {...(antiCheatProps ?? {})}
          />
          <div className="pointer-events-none absolute bottom-4 right-4 h-10 w-10 border-b-2 border-r-2 border-[rgba(0,132,255,0.2)]" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <p className="font-inter text-[13px] font-medium text-muted">
            {wordCount} words. Short answers can be submitted, but may score lower.
          </p>
          <p className="font-inter text-[13px] font-semibold text-muted sm:text-right">
            Structured answers score better than long answers.
          </p>
        </div>

        {evaluationError && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="font-inter text-sm font-semibold text-red-700">
              {evaluationError}
            </p>
            <p className="mt-1 font-inter text-xs leading-5 text-red-600">
              Your answer is still here. Retry evaluation or skip this question.
            </p>
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button
            variant="primary"
            fullWidth
            showArrow
            disabled={!canSubmit}
            onClick={() => onSubmit(answer)}
          >
            {evaluationError ? "Retry Evaluation" : "Submit Answer"}
          </Button>

          <button
            type="button"
            onClick={onSkip}
            className="rounded-2xl border border-[rgba(0,0,0,0.12)] bg-white px-5 py-3 font-inter text-sm font-bold text-text transition hover:border-[#0084FF]/45 hover:text-[#0084FF]"
          >
            Skip Question
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <button
              type="button"
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className="rounded-2xl border border-[rgba(0,0,0,0.10)] bg-[#F8F9FC] px-4 py-2.5 font-inter text-sm font-bold text-text transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={onNext}
              disabled={!canGoNext}
              className="rounded-2xl border border-[rgba(0,0,0,0.10)] bg-[#F8F9FC] px-4 py-2.5 font-inter text-sm font-bold text-text transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex">
            <button
              type="button"
              onClick={onQuit}
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 font-inter text-sm font-bold text-red-700 transition hover:bg-red-100"
            >
              Quit Interview
            </button>

            <button
              type="button"
              onClick={onComplete}
              className="rounded-2xl bg-navy px-4 py-2.5 font-inter text-sm font-bold text-white transition hover:bg-[#10205A]"
            >
              Complete Interview
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
