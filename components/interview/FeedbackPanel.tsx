"use client";

import { Button } from "@/components/ui/Button";
import { ScoreBar } from "@/components/ui/ScoreBar";
import type { FeedbackData } from "@/lib/types";

interface FeedbackPanelProps {
  feedback: FeedbackData;
  onNext: () => void;
}

export function FeedbackPanel({ feedback, onNext }: FeedbackPanelProps) {
  return (
    <div className="rounded-3xl p-9 bg-off-white border border-[rgba(0,132,255,0.1)] mt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-fustat font-bold text-lg text-text">AI Feedback</h3>
        <span className="font-inter font-bold text-sm text-white bg-blue px-3 py-1 rounded-full">
          {feedback.compositeScore}/100
        </span>
      </div>

      <div className="space-y-5">
        {feedback.dimensions.map((d) => (
          <ScoreBar
            key={d.label}
            label={d.label}
            value={d.value}
            reason={d.reason}
            labelWidth="130px"
          />
        ))}
      </div>

      <hr className="border-[rgba(0,0,0,0.06)] my-6" />

      <h4 className="font-fustat font-bold text-[15px] text-text mb-3">
        Model answer
      </h4>
      <p className="font-inter text-[15px] text-text leading-[1.7]">
        {feedback.modelAnswer}
      </p>

      <div className="mt-7">
        <Button variant="primary" fullWidth showArrow onClick={onNext}>
          Next Question
        </Button>
      </div>
    </div>
  );
}
