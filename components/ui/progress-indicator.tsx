"use client";

import { motion } from "framer-motion";
import { CircleCheck } from "lucide-react";

type ProgressIndicatorProps = {
  step: number;
  canContinue?: boolean;
  onContinue: () => void;
  onBack: () => void;
  mode?: "dots" | "buttons";
};

export default function ProgressIndicator({
  step,
  canContinue = true,
  onContinue,
  onBack,
  mode = "dots",
}: ProgressIndicatorProps) {
  const isFirstStep = step === 1;

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {mode === "dots" && (
        <div className="px-7 py-4">
          <div className="relative flex items-center gap-6">
            {[1, 2, 3].map((dot) => (
              <div
                key={dot}
                className={`relative z-10 h-2.5 w-2.5 rounded-full border border-white/70 ${
                  dot <= step ? "bg-white" : "bg-slate-300"
                }`}
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

      {mode === "buttons" && (
        <div className="w-full max-w-sm">
          <motion.div
            className="flex items-center gap-2"
            animate={{ justifyContent: isFirstStep ? "stretch" : "space-between" }}
          >
            {!isFirstStep && (
              <motion.button
                initial={{ opacity: 0, width: 0, scale: 0.8 }}
                animate={{ opacity: 1, width: "64px", scale: 1 }}
                onClick={onBack}
                className="flex h-12 items-center justify-center rounded-xl bg-gray-100 px-4 text-sm font-semibold text-black"
                type="button"
              >
                Back
              </motion.button>
            )}

            <motion.button
              onClick={onContinue}
              disabled={!canContinue}
              animate={{ flex: isFirstStep ? 1 : "inherit" }}
              className={`h-12 rounded-xl bg-[#006cff] px-4 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                isFirstStep ? "w-full" : "w-44"
              }`}
              type="button"
            >
              <div className="flex items-center justify-center gap-2 text-sm font-semibold">
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
}
