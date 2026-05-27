"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { FeedbackPanel } from "@/components/interview/FeedbackPanel";
import { TabSwitchWarning } from "@/components/interview/TabSwitchWarning";
import ProfileStepper from "@/components/ProfileStepper";
import { useAntiCheat } from "@/hooks/useAntiCheat";
import { createZeroFeedback, evaluateAnswerQuality } from "@/lib/answerQuality";
import { MOCK_FEEDBACK } from "@/lib/mockData";
import type { QuestionReview } from "@/lib/types";
import { AlertTriangle, ArrowRight, Clock, LockKeyhole, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

const TOTAL = 5;

type SetupData = {
  domain: string;
  experience: string;
  companyType: string;
};

type Stage = "setup" | "terms" | "interview" | "feedback";

export default function InterviewPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("setup");
  const [current, setCurrent] = useState(1);
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(MOCK_FEEDBACK);
  const [evaluating, setEvaluating] = useState(false);
  const [questionScores, setQuestionScores] = useState<{ question: string; score: number }[]>([]);
  const [questionReviews, setQuestionReviews] = useState<QuestionReview[]>([]);
  const [dimensionHistory, setDimensionHistory] = useState<typeof MOCK_FEEDBACK.dimensions[]>([]);
  const [setup, setSetup] = useState<SetupData>({
    domain: "",
    experience: "",
    companyType: "",
  });
  const [pendingSetup, setPendingSetup] = useState<SetupData | null>(null);

  const {
    strikeCount,
    showWarningModal,
    dismissWarning,
    shouldAutoSubmit,
    timerDisplay,
    resetTimer,
    textareaProps,
  } = useAntiCheat(stage === "interview" && !evaluating);

  const toPercentScore = (scoreOutOf40: number) =>
    Math.round((Math.max(0, Math.min(40, scoreOutOf40)) / 40) * 100);

  const saveResults = useCallback(async (
    reviews: QuestionReview[],
    completionReason: "completed" | "autoSubmitted"
  ) => {
    const allReviews = Array.from({ length: TOTAL }, (_, i) => {
      const questionLabel = `Q${i + 1}`;
      const existing = reviews.find((item) => item.question === questionLabel);

      return existing ?? {
        question: questionLabel,
        prompt: questions[i] ?? "Question not available",
        score: 0,
        status: "autoSkipped" as const,
        reason: "The session ended before this question was answered.",
      };
    });

    const allQuestionScores = allReviews.map((item) => ({
      question: item.question,
      score: item.score,
    }));

    const validScores = allReviews
      .filter((item) => item.status === "answered")
      .map((item) => item.score);

    const compositeScore = validScores.length
      ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
      : 0;

    const zeroDimensions = [
      {
        label: "Communication",
        value: 0,
        color: "#0084FF",
        reason: "No valid answer was submitted.",
      },
      {
        label: "Problem Solving",
        value: 0,
        color: "#319AFF",
        reason: "No valid answer was submitted.",
      },
      {
        label: "Specificity",
        value: 0,
        color: "#FF6B3D",
        reason: "No valid answer was submitted.",
      },
      {
        label: "Accuracy",
        value: 0,
        color: "#0084FF",
        reason: "No valid answer was submitted.",
      },
    ];

    const resultDimensions =
      dimensionHistory.length > 0
        ? dimensionHistory[0].map((dimension, index) => {
            const total = dimensionHistory.reduce(
              (sum, item) => sum + (item[index]?.value ?? 0),
              0
            );

            return {
              ...dimension,
              value: Number((total / dimensionHistory.length).toFixed(1)),
            };
          })
        : zeroDimensions;

    let aiSummary: {
      overallSummary?: string;
      needsImprovement?: string[];
      questionReviews?: QuestionReview[];
    } | null = null;

    try {
      const summaryRes = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completionReason, questionReviews: allReviews }),
      });

      if (summaryRes.ok) {
        aiSummary = await summaryRes.json();
      }
    } catch {
      aiSummary = null;
    }

    sessionStorage.setItem(
      "preppeer_results",
      JSON.stringify({
        compositeScore,
        dimensions: resultDimensions,
        questionScores: allQuestionScores,
        summary: {
          completionReason,
          overallSummary:
            aiSummary?.overallSummary ?? "AI summary could not be generated right now.",
          needsImprovement:
            aiSummary?.needsImprovement ?? ["Write clear, specific answers with real examples."],
          questionReviews: allReviews.map((item) => {
            const aiReview = aiSummary?.questionReviews?.find(
              (review) => review.question === item.question
            );

            return {
              ...item,
              summary: aiReview?.summary ?? item.summary,
              improvement: aiReview?.improvement ?? item.improvement,
            };
          }),
        },
      })
    );
  }, [dimensionHistory, questions]);

  useEffect(() => {
    if (shouldAutoSubmit) {
      saveResults(questionReviews, "autoSubmitted").then(() => {
        router.push("/results");
      });
    }
  }, [shouldAutoSubmit, router, questionReviews, saveResults]);

  const handleStart = async (profileSetup = setup) => {
    if (!profileSetup.domain || !profileSetup.experience || !profileSetup.companyType) {
      setError("Please fill in all fields.");
      return;
    }

    setSetup(profileSetup);
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileSetup),
      });

      const data = await res.json();

      if (data.questions) {
        setQuestions(data.questions);
        setQuestionScores([]);
        setQuestionReviews([]);
        setDimensionHistory([]);
        sessionStorage.removeItem("preppeer_results");
        setStage("interview");
      } else {
        setError("Failed to generate questions. Try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (answer: string) => {
    const answerQuality = evaluateAnswerQuality(answer);

    if (!answerQuality.valid) {
      const zeroFeedback = createZeroFeedback(answerQuality.reason);

      setFeedback(zeroFeedback);
      setQuestionScores((prev) => [
        ...prev,
        { question: `Q${current}`, score: 0 },
      ]);
      setQuestionReviews((prev) => [
        ...prev,
        {
          question: `Q${current}`,
          prompt: questions[current - 1],
          answer,
          score: 0,
          status: "gibberish",
          reason: answerQuality.reason,
        },
      ]);
      setStage("feedback");
      return;
    }

    setEvaluating(true);

    try {
      const evalRes = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questions[current - 1],
          answer,
          domain: setup.domain,
          experience: setup.experience,
        }),
      });

      const evalData = await evalRes.json();

      if (evalData.feedback) {
        const score = toPercentScore(evalData.feedback.compositeScore);

        setFeedback(evalData.feedback);
        setDimensionHistory((prev) => [...prev, evalData.feedback.dimensions]);
        setQuestionScores((prev) => [
          ...prev,
          { question: `Q${current}`, score },
        ]);
        setQuestionReviews((prev) => [
          ...prev,
          {
            question: `Q${current}`,
            prompt: questions[current - 1],
            answer,
            score,
            status: "answered",
            reason:
              evalData.feedback.dimensions
                ?.map((d: { label: string; reason?: string }) => `${d.label}: ${d.reason}`)
                .join(" ") ?? "",
          },
        ]);
      }
    } catch {
      // fallback
    } finally {
      setEvaluating(false);
      setStage("feedback");
    }
  };

  const handleNext = () => {
    if (current >= TOTAL) {
      saveResults(questionReviews, "completed").then(() => {
        router.push("/results");
      });
    } else {
      setCurrent((c) => c + 1);
      resetTimer();
      setStage("interview");
    }
  };

  if (stage === "setup" || stage === "terms") {
    return (
      <div className="min-h-screen bg-white">
        <Navbar variant="inner" />
        <div className="max-w-[560px] mx-auto px-6 py-28">
          <h1 className="font-fustat font-extrabold text-3xl text-text mb-2">
            Set up your interview
          </h1>
          <p className="font-inter text-muted text-base mb-10">
            Tell us about the role so we can tailor your questions.
          </p>

          <ProfileStepper
            onComplete={(data) => {
              const nextSetup = {
                domain: data.jobRole,
                experience: data.experienceLevel,
                companyType: data.companyType,
              };

              setPendingSetup(nextSetup);
              setSetup(nextSetup);
              setError("");
              setStage("terms");
            }}
          />

          {error && (
            <p className="mt-5 text-center font-inter text-sm text-red-500">{error}</p>
          )}
        </div>

        <IntegrityTermsModal
          visible={stage === "terms"}
          loading={loading}
          error={error}
          setup={pendingSetup}
          onBack={() => {
            if (!loading) setStage("setup");
          }}
          onAccept={() => {
            if (pendingSetup) handleStart(pendingSetup);
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-white"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
    >
      <TabSwitchWarning
        strikeCount={strikeCount}
        onDismiss={dismissWarning}
        visible={showWarningModal}
      />

      <Navbar
        variant="inner"
        sessionLabel={`${setup.domain} - ${setup.experience} - ${setup.companyType}`}
        progress={{ current, total: TOTAL }}
      />

      <div className="max-w-[800px] mx-auto px-6 py-20">
        {stage === "interview" && !evaluating && (
          <div className="mb-6 border-y border-[rgba(0,0,0,0.08)] py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="h-8 w-px bg-[#00A07A]" />
                <ShieldCheck size={18} color="#00A07A" strokeWidth={1.8} />
                <div>
                  <p className="font-inter text-[11px] font-bold uppercase tracking-[0.16em] text-[#00A07A]">
                    Integrity watch
                  </p>
                  <p className="font-inter text-[13px] font-medium text-muted">
                    Controls are active across this session page
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:text-right">
                <Clock size={17} color="#6B7280" strokeWidth={1.8} />
                <div>
                  <p className="font-inter text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                    Elapsed
                  </p>
                  <p className="font-inter text-[18px] font-extrabold tabular-nums text-text">
                    {timerDisplay}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {stage === "interview" ? (
            evaluating ? (
              <motion.div
                key="evaluating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 gap-4"
              >
                <div className="w-10 h-10 border-4 border-[#319AFF] border-t-transparent rounded-full animate-spin" />
                <p className="font-inter text-muted text-sm">Evaluating your answer...</p>
              </motion.div>
            ) : (
              <motion.div
                key={`q-${current}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
              >
                <QuestionCard
                  questionNumber={current}
                  totalQuestions={TOTAL}
                  question={questions[current - 1]}
                  onSubmit={handleSubmit}
                  antiCheatProps={textareaProps}
                />
              </motion.div>
            )
          ) : (
            <motion.div
              key={`f-${current}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              <div className="rounded-3xl p-10 bg-white border border-[rgba(0,132,255,0.15)] opacity-60">
                <p className="font-inter text-sm text-muted mb-2">
                  Question {current} of {TOTAL} - submitted
                </p>
              </div>

              <FeedbackPanel
                feedback={feedback}
                onNext={handleNext}
                isFinalQuestion={current >= TOTAL}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {strikeCount > 0 && (
          <div
            className="mt-6 border-l-2 py-3 pl-4"
            style={{
              borderColor: strikeCount >= 2 ? "#FF6B3D" : "#FFBE3D",
              background: strikeCount >= 2
                ? "linear-gradient(90deg, rgba(255,107,61,0.08), transparent)"
                : "linear-gradient(90deg, rgba(255,190,61,0.1), transparent)",
            }}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p
                  className="font-inter text-[11px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: strikeCount >= 2 ? "#CC4422" : "#996600" }}
                >
                  Session attention record
                </p>
                <p className="mt-1 font-inter text-sm font-semibold text-text">
                  {strikeCount === 1
                    ? "One tab change has been recorded."
                    : "Two tab changes have been recorded. The next one completes the session."}
                </p>
              </div>
              <p className="font-inter text-[13px] font-bold tabular-nums text-muted">
                {Math.min(strikeCount, 2)} / 2 warnings used
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function IntegrityTermsModal({
  visible,
  loading,
  error,
  setup,
  onBack,
  onAccept,
}: {
  visible: boolean;
  loading: boolean;
  error: string;
  setup: SetupData | null;
  onBack: () => void;
  onAccept: () => void;
}) {
  if (!visible) return null;

  const profileLabel = setup
    ? `${setup.domain} - ${setup.experience} - ${setup.companyType}`
    : "Selected interview profile";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[300] flex items-center justify-center px-5 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: "rgba(10,10,15,0.52)", backdropFilter: "blur(5px)" }}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 10 }}
          transition={{ type: "spring", stiffness: 360, damping: 28 }}
          className="w-full max-w-[640px] overflow-hidden rounded-3xl bg-white shadow-[0_32px_90px_rgba(0,0,0,0.24)]"
        >
          <div className="h-1 bg-gradient-to-r from-[#0084FF] via-[#00C896] to-[#FFBE3D]" />

          <div className="p-7 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(0,132,255,0.1)]">
                <LockKeyhole size={23} color="#0084FF" />
              </div>
              <div>
                <h2 className="font-fustat text-2xl font-extrabold tracking-[-0.04em] text-text sm:text-3xl">
                  Accept terms to continue
                </h2>
                <p className="mt-2 font-inter text-sm font-semibold text-muted">
                  {profileLabel}
                </p>
              </div>
            </div>

            <p className="mt-6 font-inter text-[15px] leading-7 text-muted">
              To ensure honest participation and fair scoring, this interview session will run with anti-cheating controls enabled.
            </p>

            <ul className="mt-5 list-disc space-y-3 pl-5 font-inter text-sm leading-6 text-text">
              <li>Ctrl/Cmd + C, Ctrl/Cmd + V, Ctrl/Cmd + A, copy, cut, paste, and right click are disabled across the interview page.</li>
              <li>Switching tabs or leaving the application once or twice will give you a warning.</li>
              <li>On the third tab or application switch, the session will be marked as completed automatically.</li>
              <li>A session completed due to this rule will exhaust one available session.</li>
            </ul>

            <div className="mt-5 flex items-start gap-3 border-t border-[rgba(0,0,0,0.08)] pt-5">
              <AlertTriangle className="mt-0.5 shrink-0" size={18} color="#996600" />
              <p className="font-inter text-sm font-semibold leading-6 text-[#664400]">
                Continue only when you are ready to stay on this page until the session ends.
              </p>
            </div>

            {error && (
              <p className="mt-5 font-inter text-sm font-semibold text-red-500">
                {error}
              </p>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onBack}
                disabled={loading}
                className="rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white px-5 py-3 font-inter text-sm font-semibold text-text transition hover:bg-[#F8F9FC] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onAccept}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0084FF] px-5 py-3 font-inter text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,132,255,0.28)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {loading ? "Generating questions..." : "Accept and Continue"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
