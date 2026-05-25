"use client";

import React from "react";
import { motion } from "framer-motion";
import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type ProgressIndicatorProps = {
  step: number;
  canContinue?: boolean;
  onContinue: () => void;
  onBack: () => void;
  mode?: "full" | "dots" | "buttons";
};

const ProgressIndicator = ({
  step,
  canContinue = true,
  onContinue,
  onBack,
  mode = "full",
}: ProgressIndicatorProps) => {
  const isExpanded = step === 1;

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {mode !== "buttons" && (
        <div className="px-7 py-4">
          <div className="relative flex items-center gap-6">
            {[1, 2, 3].map((dot) => (
              <div
                key={dot}
                className={cn(
                  "relative z-10 h-2.5 w-2.5 rounded-full border border-white/70",
                  dot <= step ? "bg-white" : "bg-slate-300"
                )}
              />
            ))}

            <motion.div
              initial={{ width: "24px" }}
              animate={{
                width: step === 1 ? "24px" : step === 2 ? "60px" : "96px",
              }}
              className="absolute -left-[8px] top-1/2 h-6 -translate-y-1/2 rounded-full border border-[#15803D] bg-[#16A34A] shadow-[0_8px_24px_rgba(22,163,74,0.35)]"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                mass: 0.8,
                bounce: 0.25,
                duration: 0.6,
              }}
            />
          </div>
        </div>
      )}

      {mode !== "dots" && (
      <div className="w-full max-w-sm">
        <motion.div
          className="flex items-center gap-1"
          animate={{
            justifyContent: isExpanded ? "stretch" : "space-between",
          }}
        >
          {!isExpanded && (
            <motion.button
              initial={{ opacity: 0, width: 0, scale: 0.8 }}
              animate={{ opacity: 1, width: "64px", scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
                mass: 0.8,
                bounce: 0.25,
                duration: 0.6,
                opacity: { duration: 0.2 },
              }}
              onClick={onBack}
              className="flex h-12 w-16 flex-1 items-center justify-center rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-black transition-colors hover:border hover:bg-gray-50"
              type="button"
            >
              Back
            </motion.button>
          )}
          <motion.button
            onClick={onContinue}
            disabled={!canContinue}
            animate={{
              flex: isExpanded ? 1 : "inherit",
            }}
            className={cn(
              "h-12 w-56 flex-1 rounded-xl bg-[#006cff] px-4 py-3 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              !isExpanded && "w-44"
            )}
            type="button"
          >
            <div className="flex items-center justify-center gap-2 text-sm font-[600]">
              {step === 3 && canContinue && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 15,
                    mass: 0.5,
                    bounce: 0.4,
                  }}
                >
                  <CircleCheck size={16} />
                </motion.div>
              )}
              {step === 3 ? "Finish" : "Continue"}
            </div>
          </motion.button>
        </motion.div>
      </div>
      )}
    </div>
  );
};

export default ProgressIndicator;
