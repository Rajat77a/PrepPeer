"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { FeedbackPanel } from "@/components/interview/FeedbackPanel";
// import { TabSwitchWarning } from "@/components/interview/TabSwitchWarning";
import ProfileStepper from "@/components/ProfileStepper";
import { useAntiCheat } from "@/hooks/useAntiCheat";
import { createZeroFeedback, evaluateAnswerQuality } from "@/lib/answerQuality";
import { MOCK_FEEDBACK } from "@/lib/mockData";
import { createClient } from "@/utils/supabase/client";
import { csrfHeaders } from "@/utils/csrf";
import type { FeedbackData, QuestionReview } from "@/lib/types";
import { isValidSetup } from "@/lib/validation";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

const TOTAL = 5;

type SetupData = {
  domain: string;
  experience: string;
  companyType: string;
};

type Stage = "setup" | "terms" | "ready" | "interview" | "feedback";

const reportLoadingSteps = [
  "Checking your answers against the interview rubric...",
  "Preparing your strongest and weakest areas...",
  "Building model answers for skipped questions...",
  "Saving your final session report...",
];

export default function InterviewPage() {
  const router = useRouter();
  const [accessChecked, setAccessChecked] = useState(false);
  const [stage, setStage] = useState<Stage>("setup");
  const [readyCountdown, setReadyCountdown] = useState(5);
  const [current, setCurrent] = useState(1);
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionSetToken, setQuestionSetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [directStarting, setDirectStarting] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(MOCK_FEEDBACK);
  const [feedbackByQuestion, setFeedbackByQuestion] = useState<
    Record<number, FeedbackData>
  >({});
  const [evaluating, setEvaluating] = useState(false);
  const [answerDrafts, setAnswerDrafts] = useState<Record<number, string>>({});
  const [evaluationErrors, setEvaluationErrors] = useState<Record<number, string>>({});
  const [aiDetected, setAiDetected] = useState<{
    isAI: boolean;
    confidence: number;
    reason: string;
  } | null>(null);
  const [questionReviews, setQuestionReviews] = useState<QuestionReview[]>([]);
  const [endingSession, setEndingSession] = useState(false);
  const [completionError, setCompletionError] = useState("");
  const [completionRetry, setCompletionRetry] = useState(0);
  const [setup, setSetup] = useState<SetupData>({
    domain: "",
    experience: "",
    companyType: "",
  });
  const [pendingSetup, setPendingSetup] = useState<SetupData | null>(null);
  const autoStartRef = useRef(false);
  const autoSubmitStartedRef = useRef(false);
  const autoSubmitFailedRef = useRef(false);
  const questionReviewsRef = useRef<QuestionReview[]>([]);

  useEffect(() => {
    questionReviewsRef.current = questionReviews;
  }, [questionReviews]);

  const appendQuestionReview = useCallback((review: QuestionReview) => {
    const nextReviews = [
      ...questionReviewsRef.current.filter(
        (existing) => existing.question !== review.question
      ),
      review,
    ].sort(
      (left, right) =>
        Number(left.question.slice(1)) - Number(right.question.slice(1))
    );

    questionReviewsRef.current = nextReviews;
    setQuestionReviews(nextReviews);
  }, []);

  const {
    // strikeCount,
    // showWarningModal,
    // dismissWarning,
    shouldAutoSubmit,
    timerDisplay,
    resetTimer,
    textareaProps,
  } = useAntiCheat(
    questions.length === TOTAL &&
      (stage === "interview" || stage === "feedback") &&
      !endingSession
  );

  useEffect(() => {
    if (stage !== "ready") return;

    setReadyCountdown(5);
    const interval = window.setInterval(() => {
      setReadyCountdown((value) => {
        if (value <= 1) {
          window.clearInterval(interval);
          resetTimer();
          setStage("interview");
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [resetTimer, stage]);

  useEffect(() => {
    const checkAccountAccess = async () => {
      const params = new URLSearchParams(window.location.search);
      const isAccountMode = params.get("mode") === "account";
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?next=%2Finterview%3Fmode%3Daccount");
        return;
      }

      if (!isAccountMode) {
        setAccessChecked(true);
        router.replace("/interview?mode=account");
        return;
      }

      setAccessChecked(true);
    };

    void checkAccountAccess();
  }, [router]);

  const saveResults = useCallback(async (
    reviews: QuestionReview[],
    completionReason: "completed" | "autoSubmitted"
  ) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);

    try {
      const response = await fetch("/api/interview-session", {
        method: "POST",
        headers: csrfHeaders({ "Content-Type": "application/json" }),
        signal: controller.signal,
        body: JSON.stringify({
          setup,
          completionReason,
          questionReviews: reviews,
          questionSetToken,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? "The interview result could not be saved.");
      }

      sessionStorage.setItem(
        "preppeer_results",
        JSON.stringify({
          source: "account",
          role: setup.domain,
          companyType: setup.companyType,
          unlockedSessionId: result.sessionId,
          compositeScore: result.compositeScore,
          dimensions: result.dimensions,
          questionScores: result.questionScores,
          summary: result.summary,
        })
      );
      setError("");
      return true;
    } catch (saveError) {
      setError(
        saveError instanceof DOMException && saveError.name === "AbortError"
          ? "The session save took too long. Retrying securely..."
          : saveError instanceof Error
          ? saveError.message
          : "The interview result could not be saved."
      );
      return false;
    } finally {
      window.clearTimeout(timeout);
    }
  }, [questionSetToken, setup]);

  const currentReview = questionReviews.find(
    (review) => review.question === `Q${current}`
  );
  const displayedFeedback = feedbackByQuestion[current] ?? feedback;

  const navigateToQuestion = useCallback(
    (questionNumber: number) => {
      const bounded = Math.max(1, Math.min(TOTAL, questionNumber));
      const review = questionReviewsRef.current.find(
        (item) => item.question === `Q${bounded}`
      );

      setCurrent(bounded);
      setAiDetected(null);
      resetTimer();
      setStage(review ? "feedback" : "interview");
    },
    [resetTimer]
  );

  const getCompletionReviews = useCallback(() => {
    const existing = questionReviewsRef.current;

    return Array.from({ length: TOTAL }, (_, index) => {
      const question = `Q${index + 1}`;
      const review = existing.find((item) => item.question === question);

      return (
        review ?? {
          question,
          prompt: questions[index] ?? "",
          score: 0,
          status: "autoSkipped" as const,
          reason: "The interview was completed before this question was answered.",
        }
      );
    });
  }, [questions]);

  const completeInterview = useCallback(async () => {
    if (endingSession || shouldAutoSubmit) return;

    const reviews = getCompletionReviews();
    const answeredCount = reviews.filter(
      (review) => review.status === "answered"
    ).length;

    const confirmed = window.confirm(
      `Complete this interview now? ${answeredCount} of ${TOTAL} questions are answered. Unanswered questions will be marked as skipped.`
    );
    if (!confirmed) return;

    setEndingSession(true);
    setEvaluating(true);
    const saved = await saveResults(reviews, "completed");
    setEvaluating(false);

    if (saved) {
      router.push("/results");
    } else {
      setEndingSession(false);
    }
  }, [endingSession, getCompletionReviews, router, saveResults, shouldAutoSubmit]);

  const quitInterview = useCallback(() => {
    const confirmed = window.confirm(
      "Quit this interview? Your current interview will not be saved as a completed session."
    );
    if (!confirmed) return;

    sessionStorage.removeItem("preppeer_results");
    router.push("/dashboard");
  }, [router]);

  useEffect(() => {
    if (
      !shouldAutoSubmit ||
      evaluating ||
      autoSubmitStartedRef.current ||
      autoSubmitFailedRef.current
    ) {
      return;
    }

    const finalizeSession = async () => {
      if (document.hidden || autoSubmitStartedRef.current) return;

      autoSubmitStartedRef.current = true;
      setEndingSession(true);
      setCompletionError("");
      setEvaluating(true);

      let saved = false;
      for (let attempt = 0; attempt < 3 && !saved; attempt += 1) {
        saved = await saveResults(
          questionReviewsRef.current,
          "autoSubmitted"
        );
        if (!saved && attempt < 2) {
          await new Promise((resolve) => window.setTimeout(resolve, 500));
        }
      }

      if (saved) {
        router.replace("/results");
        return;
      }

      autoSubmitStartedRef.current = false;
      autoSubmitFailedRef.current = true;
      setEvaluating(false);
      setCompletionError(
        "Your session could not be saved securely. Check the server connection, then retry."
      );
    };

    if (document.hidden) {
      const handleVisible = () => {
        if (!document.hidden) {
          document.removeEventListener("visibilitychange", handleVisible);
          void finalizeSession();
        }
      };

      document.addEventListener("visibilitychange", handleVisible);
      return () =>
        document.removeEventListener("visibilitychange", handleVisible);
    }

    void finalizeSession();
  }, [
    completionRetry,
    evaluating,
    router,
    saveResults,
    shouldAutoSubmit,
  ]);

  const handleStart = async (profileSetup = setup) => {
    const normalizedSetup = {
      domain: profileSetup.domain.trim(),
      experience: profileSetup.experience.trim(),
      companyType: profileSetup.companyType.trim(),
    };

    if (
      !normalizedSetup.domain ||
      !normalizedSetup.experience ||
      !normalizedSetup.companyType
    ) {
      setError("Please fill in all fields.");
      return;
    }

    setSetup(normalizedSetup);
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: csrfHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(normalizedSetup),
      });

      const data = await res.json();

      if (
        res.ok &&
        Array.isArray(data.questions) &&
        data.questions.length === TOTAL &&
        typeof data.questionSetToken === "string"
      ) {
        setQuestions(data.questions);
        setQuestionSetToken(data.questionSetToken);
        setQuestionReviews([]);
        setFeedbackByQuestion({});
        setAnswerDrafts({});
        setEvaluationErrors({});
        questionReviewsRef.current = [];
        autoSubmitStartedRef.current = false;
        autoSubmitFailedRef.current = false;
        setEndingSession(false);
        setCompletionError("");
        sessionStorage.removeItem("preppeer_results");
        setError("");
        setStage("ready");
      } else {
        setError("Failed to generate questions. Try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setDirectStarting(false);
    }
  };

  useEffect(() => {
    if (autoStartRef.current || stage !== "setup") return;

    const params = new URLSearchParams(window.location.search);
    const shouldAutoStart =
      params.get("mode") === "account" && params.get("autostart") === "1";

    if (!shouldAutoStart) return;

    const nextSetup = {
      domain: params.get("role") ?? "",
      experience: params.get("experience") ?? "",
      companyType: params.get("company") ?? "",
    };

    if (!isValidSetup(nextSetup)) {
      return;
    }

    autoStartRef.current = true;
    setDirectStarting(true);
    setPendingSetup(nextSetup);
    setSetup(nextSetup);
    void handleStart(nextSetup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const handleSubmit = async (answer: string) => {
    if (endingSession || shouldAutoSubmit) return;

    const answerQuality = evaluateAnswerQuality(answer, questions[current - 1]);

    if (!answerQuality.valid) {
      const zeroFeedback = createZeroFeedback(answerQuality.reason);

      setFeedback(zeroFeedback);
      setFeedbackByQuestion((currentFeedback) => ({
        ...currentFeedback,
        [current]: zeroFeedback,
      }));
      setAiDetected(null);
      setEvaluationErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };
        delete nextErrors[current];
        return nextErrors;
      });
      appendQuestionReview({
        question: `Q${current}`,
        prompt: questions[current - 1],
        answer,
        score: 0,
        status: "gibberish",
        reason: answerQuality.reason,
      });
      setStage("feedback");
      return;
    }

    setEvaluating(true);
    let evaluationSucceeded = false;

    try {
      const [evalRes, detectRes] = await Promise.all([
        fetch("/api/evaluate-answer", {
          method: "POST",
          headers: csrfHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({
            question: questions[current - 1],
            answer,
            domain: setup.domain,
            experience: setup.experience,
            questionIndex: current - 1,
            questionSetToken,
          }),
        }),
        fetch("/api/detect-ai", {
          method: "POST",
          headers: csrfHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ answer }),
        }),
      ]);

      const evalData = await evalRes.json();
      const detectData = await detectRes.json();

      if (!evalRes.ok || !detectRes.ok) {
        throw new Error(
          evalData.error ??
            detectData.error ??
            "This answer could not be evaluated."
        );
      }

      const isAI = detectData?.isAI === true;

      if (isAI) {
        const aiFeedback = createZeroFeedback(
          "AI-generated answer detected, so this question receives no interview credit."
        );

        setFeedback(aiFeedback);
        setFeedbackByQuestion((currentFeedback) => ({
          ...currentFeedback,
          [current]: aiFeedback,
        }));
        setEvaluationErrors((currentErrors) => {
          const nextErrors = { ...currentErrors };
          delete nextErrors[current];
          return nextErrors;
        });
        appendQuestionReview({
          question: `Q${current}`,
          prompt: questions[current - 1],
          answer,
          score: 0,
          status: "ai",
          reason: detectData.reason,
          detectionToken: detectData.detectionToken,
        });
      } else if (evalData.feedback) {
        const score = Number(evalData.feedback.compositeScore ?? 0);

        setFeedback(evalData.feedback);
        setFeedbackByQuestion((currentFeedback) => ({
          ...currentFeedback,
          [current]: evalData.feedback,
        }));
        setEvaluationErrors((currentErrors) => {
          const nextErrors = { ...currentErrors };
          delete nextErrors[current];
          return nextErrors;
        });
        appendQuestionReview({
          question: `Q${current}`,
          prompt: questions[current - 1],
          answer,
          score,
          status: "answered",
          reason:
            evalData.feedback.dimensions
              ?.map(
                (dimension: { label: string; reason?: string }) =>
                  `${dimension.label}: ${dimension.reason}`
              )
              .join(" ") ?? "",
          evaluationToken: evalData.evaluationToken,
          detectionToken: detectData.detectionToken,
          modelAnswer: evalData.feedback.modelAnswer,
        });
      } else {
        throw new Error("This answer could not be evaluated. Please retry.");
      }

      evaluationSucceeded = true;
      if (detectData) setAiDetected(detectData);
    } catch (submitError) {
      setAiDetected(null);
      setEvaluationErrors((currentErrors) => ({
        ...currentErrors,
        [current]:
          submitError instanceof Error
            ? submitError.message
            : "This answer could not be evaluated. Please retry.",
      }));
      setStage("interview");
      return;
    } finally {
      setEvaluating(false);
      if (evaluationSucceeded) {
        setStage("feedback");
      }
    }
  };

  const handleSkip = () => {
    if (endingSession || shouldAutoSubmit) return;

    const confirmed = window.confirm(
      "Skip this question? It will receive 0, but the model answer will still appear in your final report."
    );
    if (!confirmed) return;

    appendQuestionReview({
      question: `Q${current}`,
      prompt: questions[current - 1],
      score: 0,
      status: "skipped",
      reason: "You skipped this question, so it was not evaluated.",
    });
    setEvaluationErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[current];
      return nextErrors;
    });
    const skippedFeedback = createZeroFeedback(
      "You skipped this question, so it was not evaluated."
    );
    setFeedback(skippedFeedback);
    setFeedbackByQuestion((currentFeedback) => ({
      ...currentFeedback,
      [current]: skippedFeedback,
    }));
    setAiDetected(null);
    setStage("feedback");
  };

  const handleNext = () => {
    if (endingSession || shouldAutoSubmit) return;

    if (current >= TOTAL) {
      void completeInterview();
    } else {
      navigateToQuestion(current + 1);
    }
  };

  const handlePrevious = () => {
    if (endingSession || shouldAutoSubmit || current <= 1) return;
    navigateToQuestion(current - 1);
  };

  const updateDraft = (answer: string) => {
    setAnswerDrafts((currentDrafts) => ({
      ...currentDrafts,
      [current]: answer,
    }));
    if (evaluationErrors[current]) {
      setEvaluationErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };
        delete nextErrors[current];
        return nextErrors;
      });
    }
  };

  if (!accessChecked || stage === "setup" || stage === "terms") {
    if (!accessChecked || directStarting) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-white px-6">
          <div className="text-center">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-2 border-[#D7ECFF] border-t-[#0084FF]" />
            <p className="font-inter text-sm font-bold text-text">
              {accessChecked
                ? "Opening your interview room..."
                : "Checking your account..."}
            </p>
          </div>
        </div>
      );
    }

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

          {error === "Please fill in all fields." && (
            <p className="mt-5 text-center font-inter text-sm text-red-500">
              {error}
            </p>
          )}
        </div>

        <IntegrityTermsModal
          visible={stage === "terms"}
          loading={loading}
          error={error}
          setup={pendingSetup}
          onBack={() => {
            if (!loading) {
              setError("");
              setStage("setup");
            }
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
      // onContextMenu={(e) => e.preventDefault()}
      // onCopy={(e) => e.preventDefault()}
      // onCut={(e) => e.preventDefault()}
    >
      {/* <TabSwitchWarning
        strikeCount={strikeCount}
        onDismiss={dismissWarning}
        visible={showWarningModal}
      /> */}

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
          {stage === "ready" ? (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
              className="mx-auto max-w-xl py-16 text-center"
            >
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-[rgba(0,132,255,0.16)] bg-[#F4FAFF] shadow-[0_24px_70px_rgba(0,132,255,0.14)]">
                <span className="font-inter text-5xl font-black tabular-nums text-[#0084FF]">
                  {readyCountdown}
                </span>
              </div>
              <p className="mt-7 font-inter text-[11px] font-bold uppercase tracking-[0.2em] text-[#0084FF]">
                Interview starts soon
              </p>
              <h2 className="mt-3 font-fustat text-3xl font-extrabold text-text">
                Take a breath. Get ready.
              </h2>
              <p className="mx-auto mt-3 max-w-md font-inter text-sm font-medium leading-6 text-muted">
                Your questions are ready for {setup.domain}. The first question
                will open automatically after this short cool-off.
              </p>
            </motion.div>
          ) : stage === "interview" ? (
            completionError ? (
              <motion.div
                key="completion-error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-auto flex max-w-xl flex-col items-center py-20 text-center"
              >
                <AlertTriangle size={34} color="#D83A3A" strokeWidth={1.8} />
                <h2 className="mt-5 font-fustat text-2xl font-extrabold text-text">
                  Session completion paused
                </h2>
                <p className="mt-3 font-inter text-sm font-medium leading-6 text-muted">
                  {completionError}
                </p>
                {error && (
                  <p className="mt-2 font-inter text-sm font-semibold text-red-500">
                    {error}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    autoSubmitFailedRef.current = false;
                    setCompletionError("");
                    setCompletionRetry((value) => value + 1);
                  }}
                  className="mt-7 bg-[#0084FF] px-6 py-3 font-inter text-sm font-bold text-white shadow-[0_12px_30px_rgba(0,132,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#006FCC]"
                >
                  Retry secure completion
                </button>
              </motion.div>
            ) : evaluating ? (
              <motion.div
                key="evaluating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-10 h-10 rounded-full border-4 border-[#319AFF] border-t-transparent animate-spin" />
                {endingSession ? (
                  <div className="mt-6 max-w-lg">
                    <p className="font-inter text-[11px] font-bold uppercase tracking-[0.2em] text-[#0084FF]">
                      Preparing final report
                    </p>
                    <h2 className="mt-3 font-fustat text-2xl font-extrabold text-text">
                      Your session is being wrapped up.
                    </h2>
                    <div className="mt-5 space-y-2">
                      {reportLoadingSteps.map((step) => (
                        <p
                          key={step}
                          className="rounded-2xl border border-[rgba(0,132,255,0.12)] bg-[#F8FBFF] px-4 py-3 font-inter text-sm font-semibold text-muted"
                        >
                          {step}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 font-inter text-sm text-muted">
                    Evaluating your answer...
                  </p>
                )}
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
                  answer={answerDrafts[current] ?? ""}
                  evaluationError={evaluationErrors[current]}
                  canGoPrevious={current > 1}
                  canGoNext={current < TOTAL}
                  onAnswerChange={updateDraft}
                  onSubmit={handleSubmit}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onSkip={handleSkip}
                  onComplete={completeInterview}
                  onQuit={quitInterview}
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
                  Question {current} of {TOTAL} -{" "}
                  {currentReview?.status === "skipped"
                    ? "skipped"
                    : "submitted"}
                </p>
              </div>

              {aiDetected?.isAI ? (
                <div className="mt-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-6">
                  <AlertTriangle
                    className="mt-1 shrink-0"
                    size={24}
                    color="#ef4444"
                  />

                  <div>
                    <p className="font-inter font-bold text-base text-red-700">
                      AI-generated answer detected ({aiDetected.confidence}%
                      confidence)
                    </p>

                    <p className="font-inter text-sm text-red-600 mt-1 mb-4">
                      {aiDetected.reason}
                    </p>

                    <p className="font-inter text-sm text-red-700 font-medium">
                      This answer will receive 0 score and will be included in
                      your final summary.
                    </p>

                    <button
                      onClick={handleNext}
                      className="mt-4 bg-red-600 hover:bg-red-700 text-white font-inter font-semibold text-sm px-6 py-3 rounded-xl transition-all"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              ) : (
                <FeedbackPanel
                  feedback={displayedFeedback}
                  onNext={handleNext}
                  isFinalQuestion={current === TOTAL}
                />
              )}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid grid-cols-2 gap-3 sm:flex">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={current <= 1 || endingSession}
                    className="rounded-2xl border border-[rgba(0,0,0,0.10)] bg-white px-4 py-2.5 font-inter text-sm font-bold text-text transition hover:border-blue/35 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={endingSession}
                    className="rounded-2xl border border-[rgba(0,0,0,0.10)] bg-white px-4 py-2.5 font-inter text-sm font-bold text-text transition hover:border-blue/35"
                  >
                    {current >= TOTAL ? "Finish" : "Next"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:flex">
                  <button
                    type="button"
                    onClick={quitInterview}
                    disabled={endingSession}
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 font-inter text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Quit Interview
                  </button>
                  <button
                    type="button"
                    onClick={completeInterview}
                    disabled={endingSession}
                    className="rounded-2xl bg-navy px-4 py-2.5 font-inter text-sm font-bold text-white transition hover:bg-[#10205A] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Complete Interview
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
        style={{
          background: "rgba(10,10,15,0.52)",
          backdropFilter: "blur(5px)",
        }}
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
              To ensure honest participation and fair scoring, this interview
              session will run with anti-cheating controls enabled.
            </p>

            <ul className="mt-5 list-disc space-y-3 pl-5 font-inter text-sm leading-6 text-text">
              <li>
                Ctrl/Cmd + C, Ctrl/Cmd + V, Ctrl/Cmd + A, copy, cut, paste,
                and right click are disabled across the interview page.
              </li>
              <li>
                Switching tabs or leaving the application once or twice will
                give you a warning.
              </li>
              <li>
                On the third tab or application switch, the session will be
                marked as completed automatically.
              </li>
              <li>
                A session completed due to this rule will exhaust one available
                session.
              </li>
            </ul>

            <div className="mt-5 flex items-start gap-3 border-t border-[rgba(0,0,0,0.08)] pt-5">
              <AlertTriangle
                className="mt-0.5 shrink-0"
                size={18}
                color="#996600"
              />
              <p className="font-inter text-sm font-semibold leading-6 text-[#664400]">
                Continue only when you are ready to stay on this page until the
                session ends.
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
