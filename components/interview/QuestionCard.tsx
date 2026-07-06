"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useAntiCheat } from "@/hooks/useAntiCheat";
import { Button } from "@/components/ui/Button";

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  onSubmit: (answer: string) => void;
  antiCheatProps?: {
    onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    onContextMenu?: (e: React.MouseEvent<HTMLTextAreaElement>) => void;
    onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
    onCopy?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
    onCut?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  };
}

const MIN_WORDS = 50;

export function QuestionCard({
  questionNumber,
  totalQuestions,
  question,
  onSubmit,
  antiCheatProps,
}: QuestionCardProps) {
  const [answer, setAnswer] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [words, setWords] = useState<string[]>([]);

  const wordCount = words.length;
  const wordProgress = Math.min((wordCount / MIN_WORDS) * 100, 100);
  const minWords = MIN_WORDS;
  const canSubmit = wordCount >= MIN_WORDS;

  const handleAnswerChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setAnswer(value);
    setWords(value.trim().split(/\s+/).filter(Boolean));
  }, []);

  // const blockPromptSelection = (e: React.MouseEvent | React.ClipboardEvent) => {
  //   e.preventDefault();
  // };

  return (
    <motion.section
      className="rounded-3xl bg-white border border-[rgba(0,0,0,0.08)] overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div
        className="grid select-none border-b border-[rgba(0,0,0,0.07)] bg-[#FAFBFD] sm:grid-cols-[132px_1fr]"
        // onMouseDown={blockPromptSelection}
        // onContextMenu={blockPromptSelection}
        // onCopy={(e) => e.preventDefault()}
        // onCut={(e) => e.preventDefault()}
        style={{
          WebkitUserSelect: "none",
          userSelect: "none",
        }}
      >
        <div className="px-5 py-6 border-r border-[rgba(0,0,0,0.07)] sm:pr-8">
          <p className="font-inter text-[11px] font-bold uppercase tracking-[0.12em] text-muted mb-1">
            Question {questionNumber} of {totalQuestions}
          </p>
          <p className="font-fustat text-xl font-extrabold text-text leading-snug">
            {question}
          </p>
        </div>

        <div className="px-5 py-6">
          <p className="font-inter text-sm text-muted mb-4">
            Minimum {MIN_WORDS} words. Be specific — mention tradeoffs, examples,
            or frameworks you&apos;d use.
          </p>

          <textarea
            value={answer}
            onChange={handleAnswerChange}
            placeholder="Write your answer here. Use examples, tradeoffs, and clear reasoning."
            maxLength={8000}
            className="w-full min-h-[240px] resize-y border border-[rgba(0,0,0,0.12)] bg-white p-5 font-inter text-[15px] leading-7 text-text outline-none transition focus:border-[#0084FF] focus:shadow-[0_0_0_3px_rgba(0,132,255,0.11)]"
            style={{ borderRadius: 16 }}
            // {...(antiCheatProps ?? {})}
          />

          <div className="mt-4">
            <div className="relative h-[3px] overflow-hidden rounded-full bg-black/10">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${wordProgress}%` }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ background: canSubmit ? "#00A07A" : "#FFBE3D" }}
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
    </motion.section>
  );
}
