"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { FeedbackPanel } from "@/components/interview/FeedbackPanel";
import { MOCK_FEEDBACK } from "@/lib/mockData";

const TOTAL = 5;
const CURRENT = 2;

export default function InterviewPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleNext = () => {
    if (CURRENT >= TOTAL) {
      router.push("/results");
    } else {
      setSubmitted(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        variant="inner"
        sessionLabel="SDE Fresher · Product Company"
        progress={{ current: CURRENT, total: TOTAL }}
      />
      <div className="max-w-[800px] mx-auto px-6 py-20">
        {!submitted ? (
          <QuestionCard
            questionNumber={CURRENT}
            totalQuestions={TOTAL}
            onSubmit={handleSubmit}
          />
        ) : (
          <>
            <div className="rounded-3xl p-10 bg-white border border-[rgba(0,132,255,0.15)] opacity-60">
              <p className="font-inter text-sm text-muted mb-2">
                Question {CURRENT} of {TOTAL} — submitted
              </p>
            </div>
            <FeedbackPanel feedback={MOCK_FEEDBACK} onNext={handleNext} />
          </>
        )}
      </div>
    </div>
  );
}
