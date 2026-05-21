"use client";

import { motion } from "framer-motion";
import { scoreToPercent } from "@/lib/utils";
import { EASE_OUT, REPEAT_VIEWPORT } from "@/lib/motion";

interface AnimatedScoreBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  barHeight?: number;
  labelWidth?: string;
  showValue?: boolean;
  delay?: number;
}

export default function AnimatedScoreBar({
  label,
  value,
  max = 10,
  color = "#0084FF",
  barHeight = 8,
  labelWidth = "120px",
  showValue = true,
  delay = 0,
}: AnimatedScoreBarProps) {
  const percent = scoreToPercent(value, max);

  return (
    <div className="flex items-center gap-3">
      <span
        className="font-inter font-medium text-[13px] text-text shrink-0"
        style={{ width: labelWidth }}
      >
        {label}
      </span>
      <div
        className="flex-1 rounded-full bg-[#EEF2F7] overflow-hidden"
        style={{ height: barHeight }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background:
              color === "#FF6B3D"
                ? color
                : `linear-gradient(90deg, #60B1FF, ${color})`,
          }}
          initial={{ width: 0 }}
          whileInView={{ width: `${percent}%` }}
          viewport={REPEAT_VIEWPORT}
          transition={{ duration: 0.85, delay, ease: EASE_OUT }}
        />
      </div>
      {showValue && (
        <span
          className="font-inter font-semibold text-[13px] shrink-0 text-right"
          style={{ color, width: 32 }}
        >
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
