"use client";

import { Button } from "@/components/ui/Button";
import type { FeedbackData } from "@/lib/types";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface FeedbackPanelProps {
  feedback: FeedbackData;
  onNext: () => void;
  isFinalQuestion?: boolean;
}

const clampScore = (value: number) => Math.min(10, Math.max(0, Number.isFinite(value) ? value : 0));

export function FeedbackPanel({ feedback, onNext, isFinalQuestion = false }: FeedbackPanelProps) {
  const dimensions = feedback.dimensions.map((dimension) => ({
    ...dimension,
    value: clampScore(dimension.value),
  }));
  const totalScore = dimensions.reduce((sum, dimension) => sum + dimension.value, 0);
  const scoreText = Number.isInteger(totalScore) ? totalScore.toString() : totalScore.toFixed(1);

  return (
    <motion.section
      className="mt-6 overflow-hidden border border-[rgba(0,0,0,0.08)] bg-[#FAFBFD]"
      style={{ borderRadius: 20 }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="grid gap-6 border-b border-[rgba(0,0,0,0.07)] bg-white p-7 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="font-inter text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
            Interview review
          </p>
          <h3 className="mt-2 font-fustat text-2xl font-extrabold text-text">
            Performance breakdown
          </h3>
        </div>

        <div className="border-l-2 border-[#0084FF] pl-4">
          <p className="font-inter text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
            Score
          </p>
          <p className="font-inter text-3xl font-extrabold tabular-nums text-text">
            {scoreText}<span className="text-base font-bold text-muted">/40</span>
          </p>
        </div>
      </div>

      <div className="space-y-5 p-7">
        {dimensions.map((dimension, index) => (
          <motion.div
            key={dimension.label}
            className="grid gap-3 sm:grid-cols-[150px_1fr_48px] sm:items-start"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: index * 0.06, ease: "easeOut" }}
          >
            <p className="font-inter text-sm font-bold text-text">{dimension.label}</p>
            <div>
              <div className="h-2 overflow-hidden bg-[#E9EEF5]" style={{ borderRadius: 2 }}>
                <motion.div
                  className="h-full bg-[#0084FF]"
                  style={{ borderRadius: 2 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${dimension.value * 10}%` }}
                  transition={{ duration: 0.7, delay: 0.08 + index * 0.06, ease: "easeOut" }}
                />
              </div>
              {dimension.reason && (
                <p className="mt-2 font-inter text-sm italic leading-6 text-muted">
                  {dimension.reason}
                </p>
              )}
            </div>
            <p className="font-inter text-sm font-extrabold tabular-nums text-text sm:text-right">
              {dimension.value.toFixed(1)}
            </p>
          </motion.div>
        ))}

        <div className="border-t border-[rgba(0,0,0,0.07)] pt-6">
          <p className="font-inter text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
            Reference response
          </p>
          <p className="mt-3 font-inter text-[15px] leading-8 text-text">
            {feedback.modelAnswer}
          </p>
        </div>

        <div className="pt-1">
          {isFinalQuestion ? (
            <motion.button
              type="button"
              onClick={onNext}
              className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-navy px-[26px] py-4 font-inter text-base font-extrabold text-white shadow-[0_18px_42px_rgba(27,43,94,0.26)]"
              whileHover={{
                scale: 1.015,
                boxShadow: "0 22px 52px rgba(0,132,255,0.32)",
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <span className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-blue/45 to-transparent transition-transform duration-500 group-hover:translate-x-[220%]" />
              <span className="relative flex items-center gap-3">
                Finish Session
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/16 text-white transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight size={15} strokeWidth={2.5} />
                </span>
              </span>
            </motion.button>
          ) : (
            <Button variant="primary" fullWidth showArrow onClick={onNext}>
              Next Question
            </Button>
          )}
        </div>
      </div>
    </motion.section>
  );
}
