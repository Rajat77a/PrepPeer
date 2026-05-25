"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ProgressIndicator from "@/components/ui/progress-indicator";

type ProfileStepperData = {
  jobRole: string;
  experienceLevel: string;
  companyType: string;
};

type StepKey = keyof ProfileStepperData;

type Step = {
  key: StepKey;
  title: string;
  eyebrow: string;
  options: string[];
};

type ProfileStepperProps = {
  onComplete?: (data: ProfileStepperData) => void;
};

const steps: Step[] = [
  {
    key: "jobRole",
    title: "Choose your job role",
    eyebrow: "Step 1",
    options: ["SDE", "Product Manager", "Operations", "MBA", "Consulting", "Data Analyst"],
  },
  {
    key: "experienceLevel",
    title: "Pick your experience level",
    eyebrow: "Step 2",
    options: ["Fresher", "1-3 years", "3-6 years", "6+ years"],
  },
  {
    key: "companyType",
    title: "Select company type",
    eyebrow: "Step 3",
    options: ["FAANG", "Product startup", "Consulting firm", "PSU / Govt", "Mid-size tech"],
  },
];

export default function ProfileStepper({ onComplete }: ProfileStepperProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState<ProfileStepperData>({
    jobRole: "",
    experienceLevel: "",
    companyType: "",
  });

  const activeStep = steps[stepIndex];
  const selectedValue = selections[activeStep.key];
  const isLastStep = stepIndex === steps.length - 1;
  const canContinue = Boolean(selectedValue);

  const helperText = useMemo(() => {
    if (stepIndex === 0) return "We will tailor question style and difficulty around this role.";
    if (stepIndex === 1) return "Your level helps calibrate depth, expectations, and examples.";
    return "Company type decides the interview tone and evaluation benchmark.";
  }, [stepIndex]);

  const handleContinue = () => {
    if (!canContinue) return;

    if (isLastStep) {
      if (onComplete) {
        onComplete(selections);
        return;
      }
      router.push("/interview/session");
      return;
    }

    setStepIndex((current) => current + 1);
  };

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-center">
        <ProgressIndicator
          step={stepIndex + 1}
          canContinue={canContinue}
          onBack={() => setStepIndex((current) => Math.max(0, current - 1))}
          onContinue={handleContinue}
          mode="dots"
        />
      </div>

      <motion.div
        key={activeStep.key}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -18 }}
        transition={{ duration: 0.3 }}
        className="rounded-[28px] border border-[rgba(0,132,255,0.14)] bg-white p-7 shadow-[0_18px_60px_rgba(0,132,255,0.08)] sm:p-8"
      >
        <p className="mb-2 font-inter text-xs font-semibold uppercase tracking-[0.16em] text-[#0084FF]">
          {activeStep.eyebrow}
        </p>
        <h2 className="font-fustat text-2xl font-extrabold tracking-[-0.04em] text-text sm:text-3xl">
          {activeStep.title}
        </h2>
        <p className="mt-3 max-w-[420px] font-inter text-sm leading-6 text-muted">
          {helperText}
        </p>

        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {activeStep.options.map((option) => {
            const selected = selectedValue === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() =>
                  setSelections((current) => ({
                    ...current,
                    [activeStep.key]: option,
                  }))
                }
                className={`group relative flex min-h-[58px] items-center rounded-2xl border px-5 py-3 text-left font-inter text-sm font-semibold transition-all before:absolute before:bottom-3 before:left-0 before:top-3 before:w-1 before:rounded-r-full before:transition-all ${
                  selected
                    ? "border-blue-600 bg-blue-950 text-white shadow-[0_12px_32px_rgba(30,64,175,0.18)] before:bg-blue-500"
                    : "border-[rgba(0,0,0,0.09)] bg-[#F8F9FC] text-text before:bg-transparent hover:border-blue-500 hover:bg-white hover:text-blue-700 hover:before:bg-blue-200"
                }`}
                aria-pressed={selected}
              >
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="mt-6 flex justify-center">
        <ProgressIndicator
          step={stepIndex + 1}
          canContinue={canContinue}
          onBack={() => setStepIndex((current) => Math.max(0, current - 1))}
          onContinue={handleContinue}
          mode="buttons"
        />
      </div>
    </div>
  );
}
