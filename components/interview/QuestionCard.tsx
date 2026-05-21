"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { countWords } from "@/lib/utils";


interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  question?: string;   // ← add this
  onSubmit: (answer: string) => void;
}

export function QuestionCard({
  questionNumber,
  totalQuestions,
  onSubmit,
}: QuestionCardProps) {
  const [answer, setAnswer] = useState("");
  const wordCount = countWords(answer);
  const minWords = 20;
  const canSubmit = wordCount >= minWords;

  return (
    <div className="rounded-3xl p-10 bg-white border border-[rgba(0,132,255,0.15)] shadow-[0_8px_40px_rgba(0,132,255,0.08)]">
      <p className="font-inter font-medium text-[13px] text-muted">
        Question {questionNumber} of {totalQuestions}
      </p>
      <h2 className="font-fustat font-bold text-[22px] text-text leading-[1.4] my-3 mb-7">
        {question ?? "Loading question…"}
      </h2>
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here... (minimum 20 words)"
        className="w-full min-h-[180px] rounded-xl border border-[rgba(0,0,0,0.1)] p-4 font-inter text-[15px] resize-y outline-none focus:border-blue focus:shadow-[0_0_0_3px_rgba(0,132,255,0.1)] transition-shadow"
      />
      <p className="font-inter text-[13px] text-muted text-right mt-2">
        {wordCount} / {minWords} words minimum
      </p>
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
  );
}
