"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { countWords } from "@/lib/utils";
import { motion } from "framer-motion";

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  question?: string;
  onSubmit: (answer: string) => void;
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
  onSubmit,
  antiCheatProps,
}: QuestionCardProps) {
  const [answer, setAnswer] = useState("");
  const wordCount = countWords(answer);
  const minWords = 20;
  const canSubmit = wordCount >= minWords;
  const wordProgress = Math.min(100, Math.round((wordCount / minWords) * 100));
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
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your answer here. Use examples, tradeoffs, and clear reasoning."
            maxLength={8000}
            className="w-full min-h-[240px] resize-y border border-[rgba(0,0,0,0.12)] bg-white p-5 font-inter text-[15px] leading-7 text-text outline-none transition focus:border-[#0084FF] focus:shadow-[0_0_0_3px_rgba(0,132,255,0.11)]"
            style={{ borderRadius: 16 }}
            // {...(antiCheatProps ?? {})}
          />
          <div className="pointer-events-none absolute bottom-4 right-4 h-10 w-10 border-b-2 border-r-2 border-[rgba(0,132,255,0.2)]" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <div className="h-1.5 overflow-hidden bg-[#E9EEF5]" style={{ borderRadius: 2 }}>
              <motion.div
                className="h-full bg-[#0084FF]"
                style={{ borderRadius: 2 }}
                animate={{ width: `${wordProgress}%` }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            </div>
            <p className="mt-2 font-inter text-[13px] font-medium text-muted">
              {wordCount} / {minWords} words minimum
            </p>
          </div>
          <p className="font-inter text-[13px] font-semibold text-muted sm:text-right">
            Structured answers score better than long answers.
          </p>
        </div>

        <div className="mt-6">
          <Button
            variant="primary"
            fullWidth
            showArrow
            disabled={!canSubmit}
            onClick={() => onSubmit(answer)}
          >
            Submit Answer
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
