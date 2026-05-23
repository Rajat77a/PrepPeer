"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { FeedbackPanel } from "@/components/interview/FeedbackPanel";
import { TabSwitchWarning } from "@/components/interview/TabSwitchWarning";
import { useAntiCheat } from "@/hooks/useAntiCheat";
import { MOCK_FEEDBACK } from "@/lib/mockData";
import { Clock, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

const TOTAL = 5;

type SetupData = {
  domain: string;
  experience: string;
  companyType: string;
};

type Stage = "setup" | "interview" | "feedback";

export default function InterviewPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("setup");
  const [current, setCurrent] = useState(1);
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(MOCK_FEEDBACK);
  const [evaluating, setEvaluating] = useState(false);
  const [aiDetected, setAiDetected] = useState<{isAI: boolean, confidence: number, reason: string} | null>(null);
  const [setup, setSetup] = useState<SetupData>({
    domain: "",
    experience: "",
    companyType: "",
  });

  const {
    strikeCount,
    showWarningModal,
    dismissWarning,
    shouldAutoSubmit,
    timerDisplay,
    resetTimer,
  } = useAntiCheat();

  useEffect(() => {
    if (shouldAutoSubmit) {
      router.push("/results");
    }
  }, [shouldAutoSubmit, router]);

  const handleStart = async () => {
    if (!setup.domain || !setup.experience || !setup.companyType) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setup),
      });
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
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
    setEvaluating(true);
    try {
      const [evalRes, detectRes] = await Promise.all([
        fetch("/api/evaluate-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: questions[current - 1],
            answer,
            domain: setup.domain,
            experience: setup.experience,
          }),
        }),
        fetch("/api/detect-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answer }),
        }),
      ]);

      const evalData = await evalRes.json();
      const detectData = await detectRes.json();

      if (evalData.feedback) setFeedback(evalData.feedback);
      if (detectData) setAiDetected(detectData);

    } catch {
      // fallback
    } finally {
      setEvaluating(false);
      setStage("feedback");
    }
  };

  const handleNext = () => {
    if (current >= TOTAL) {
      router.push("/results");
    } else {
      setCurrent((c) => c + 1);
      setAiDetected(null);
      resetTimer();
      setStage("interview");
    }
  };

  // ── Setup screen ──────────────────────────────────────────────
  if (stage === "setup") {
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

          <div className="flex flex-col gap-6">
            <div>
              <label className="font-inter font-semibold text-sm text-text mb-2 block">
                Branch / Domain
              </label>
              <select
                className="w-full border border-[rgba(0,0,0,0.12)] rounded-xl px-4 py-3 font-inter text-sm text-text bg-white focus:outline-none focus:ring-2 focus:ring-[#319AFF]"
                value={setup.domain}
                onChange={(e) => setSetup({ ...setup, domain: e.target.value })}
              >
                <option value="">Select your domain</option>
                <option value="Software Engineering (SDE)">Software Engineering (SDE)</option>
                <option value="Data Science / ML">Data Science / ML</option>
                <option value="Product Management">Product Management</option>
                <option value="Frontend Development">Frontend Development</option>
                <option value="Backend Development">Backend Development</option>
                <option value="DevOps / Cloud">DevOps / Cloud</option>
                <option value="Business Analyst">Business Analyst</option>
                <option value="UI/UX Design">UI/UX Design</option>
              </select>
            </div>

            <div>
              <label className="font-inter font-semibold text-sm text-text mb-2 block">
                Experience Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["Fresher", "1-3 years", "3+ years"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSetup({ ...setup, experience: lvl })}
                    className={`py-3 rounded-xl border font-inter text-sm font-medium transition-all ${
                      setup.experience === lvl
                        ? "bg-[#319AFF] text-white border-[#319AFF]"
                        : "bg-white text-text border-[rgba(0,0,0,0.12)] hover:border-[#319AFF]"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-inter font-semibold text-sm text-text mb-2 block">
                Company Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["Service", "Product", "Startup"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSetup({ ...setup, companyType: type })}
                    className={`py-3 rounded-xl border font-inter text-sm font-medium transition-all ${
                      setup.companyType === type
                        ? "bg-[#319AFF] text-white border-[#319AFF]"
                        : "bg-white text-text border-[rgba(0,0,0,0.12)] hover:border-[#319AFF]"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="font-inter text-sm text-red-500">{error}</p>
            )}

            <button
              onClick={handleStart}
              disabled={loading}
              className="mt-2 w-full bg-[#319AFF] hover:bg-[#0057CC] disabled:opacity-60 text-white font-inter font-semibold text-base py-4 rounded-2xl transition-all"
            >
              {loading ? "Generating questions…" : "Start Interview →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Interview / Feedback screen ───────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <TabSwitchWarning
        strikeCount={strikeCount}
        onDismiss={dismissWarning}
        visible={showWarningModal}
      />
      <Navbar
        variant="inner"
        sessionLabel={`${setup.domain} · ${setup.experience} · ${setup.companyType}`}
        progress={{ current, total: TOTAL }}
      />
      <div className="max-w-[800px] mx-auto px-6 py-20">

        {/* Timer + protection bar */}
        {stage === "interview" && !evaluating && (
          <div className="flex items-center justify-between mb-6">
            <span className="flex items-center gap-1.5" style={{
              padding: "5px 10px",
              borderRadius: "99px",
              background: "rgba(0,200,150,0.06)",
              border: "1px solid rgba(0,200,150,0.15)",
              fontSize: "11px",
              fontWeight: 600,
              color: "#00A07A",
              fontFamily: "var(--font-inter)",
            }}>
              <ShieldCheck size={12} color="#00A07A" />
              Session Protected
            </span>
            <div className="flex items-center gap-2" style={{
              padding: "6px 14px",
              borderRadius: "99px",
              background: "rgba(0,0,0,0.03)",
              border: "1px solid rgba(0,0,0,0.06)",
              fontSize: "14px",
              fontWeight: 600,
              color: "#0A0A0F",
              fontFamily: "var(--font-inter)",
            }}>
              <Clock size={14} color="#6B7280" />
              {timerDisplay}
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
                <p className="font-inter text-muted text-sm">Evaluating your answer…</p>
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
                  Question {current} of {TOTAL} — submitted
                </p>
              </div>

              {aiDetected?.isAI ? (
                <div className="mt-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-6">
                  <span className="text-red-500 text-2xl">⚠️</span>
                  <div>
                    <p className="font-inter font-bold text-base text-red-700">
                      AI-generated answer detected ({aiDetected.confidence}% confidence)
                    </p>
                    <p className="font-inter text-sm text-red-600 mt-1 mb-4">
                      {aiDetected.reason}
                    </p>
                    <p className="font-inter text-sm text-red-700 font-medium">
                      Please write your own answer to get feedback and score.
                    </p>
                    <button
                      onClick={() => { setStage("interview"); setAiDetected(null); }}
                      className="mt-4 bg-red-600 hover:bg-red-700 text-white font-inter font-semibold text-sm px-6 py-3 rounded-xl transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                <FeedbackPanel feedback={feedback} onNext={handleNext} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Strike indicator */}
        {strikeCount > 0 && (
          <div className="flex items-center justify-center mt-6">
            <span style={{
              fontSize: "12px",
              fontWeight: 600,
              color: strikeCount >= 2 ? "#CC4422" : "#996600",
              padding: "4px 12px",
              borderRadius: "99px",
              background: strikeCount >= 2 ? "rgba(255,107,61,0.08)" : "rgba(255,190,61,0.08)",
              border: `1px solid ${strikeCount >= 2 ? "rgba(255,107,61,0.15)" : "rgba(255,190,61,0.15)"}`,
              fontFamily: "var(--font-inter)",
            }}>
              ⚠ {strikeCount} tab switch{strikeCount > 1 ? "es" : ""} detected
            </span>
          </div>
        )}

      </div>
    </div>
  );
}"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { FeedbackPanel } from "@/components/interview/FeedbackPanel";
import { TabSwitchWarning } from "@/components/interview/TabSwitchWarning";
import { useAntiCheat } from "@/hooks/useAntiCheat";
import { MOCK_FEEDBACK } from "@/lib/mockData";
import { Clock, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

const TOTAL = 5;

type SetupData = {
  domain: string;
  experience: string;
  companyType: string;
};

type Stage = "setup" | "interview" | "feedback";

export default function InterviewPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("setup");
  const [current, setCurrent] = useState(1);
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(MOCK_FEEDBACK);
  const [evaluating, setEvaluating] = useState(false);
  const [aiDetected, setAiDetected] = useState<{isAI: boolean, confidence: number, reason: string} | null>(null);
  const [setup, setSetup] = useState<SetupData>({
    domain: "",
    experience: "",
    companyType: "",
  });

  const {
    strikeCount,
    showWarningModal,
    dismissWarning,
    shouldAutoSubmit,
    timerDisplay,
    resetTimer,
  } = useAntiCheat();

  useEffect(() => {
    if (shouldAutoSubmit) {
      router.push("/results");
    }
  }, [shouldAutoSubmit, router]);

  const handleStart = async () => {
    if (!setup.domain || !setup.experience || !setup.companyType) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setup),
      });
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
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
    setEvaluating(true);
    try {
      const [evalRes, detectRes] = await Promise.all([
        fetch("/api/evaluate-answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: questions[current - 1],
            answer,
            domain: setup.domain,
            experience: setup.experience,
          }),
        }),
        fetch("/api/detect-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answer }),
        }),
      ]);

      const evalData = await evalRes.json();
      const detectData = await detectRes.json();

      if (evalData.feedback) setFeedback(evalData.feedback);
      if (detectData) setAiDetected(detectData);

    } catch {
      // fallback
    } finally {
      setEvaluating(false);
      setStage("feedback");
    }
  };

  const handleNext = () => {
    if (current >= TOTAL) {
      router.push("/results");
    } else {
      setCurrent((c) => c + 1);
      setAiDetected(null);
      resetTimer();
      setStage("interview");
    }
  };

  // ── Setup screen ──────────────────────────────────────────────
  if (stage === "setup") {
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

          <div className="flex flex-col gap-6">
            <div>
              <label className="font-inter font-semibold text-sm text-text mb-2 block">
                Branch / Domain
              </label>
              <select
                className="w-full border border-[rgba(0,0,0,0.12)] rounded-xl px-4 py-3 font-inter text-sm text-text bg-white focus:outline-none focus:ring-2 focus:ring-[#319AFF]"
                value={setup.domain}
                onChange={(e) => setSetup({ ...setup, domain: e.target.value })}
              >
                <option value="">Select your domain</option>
                <option value="Software Engineering (SDE)">Software Engineering (SDE)</option>
                <option value="Data Science / ML">Data Science / ML</option>
                <option value="Product Management">Product Management</option>
                <option value="Frontend Development">Frontend Development</option>
                <option value="Backend Development">Backend Development</option>
                <option value="DevOps / Cloud">DevOps / Cloud</option>
                <option value="Business Analyst">Business Analyst</option>
                <option value="UI/UX Design">UI/UX Design</option>
              </select>
            </div>

            <div>
              <label className="font-inter font-semibold text-sm text-text mb-2 block">
                Experience Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["Fresher", "1-3 years", "3+ years"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSetup({ ...setup, experience: lvl })}
                    className={`py-3 rounded-xl border font-inter text-sm font-medium transition-all ${
                      setup.experience === lvl
                        ? "bg-[#319AFF] text-white border-[#319AFF]"
                        : "bg-white text-text border-[rgba(0,0,0,0.12)] hover:border-[#319AFF]"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-inter font-semibold text-sm text-text mb-2 block">
                Company Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["Service", "Product", "Startup"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSetup({ ...setup, companyType: type })}
                    className={`py-3 rounded-xl border font-inter text-sm font-medium transition-all ${
                      setup.companyType === type
                        ? "bg-[#319AFF] text-white border-[#319AFF]"
                        : "bg-white text-text border-[rgba(0,0,0,0.12)] hover:border-[#319AFF]"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="font-inter text-sm text-red-500">{error}</p>
            )}

            <button
              onClick={handleStart}
              disabled={loading}
              className="mt-2 w-full bg-[#319AFF] hover:bg-[#0057CC] disabled:opacity-60 text-white font-inter font-semibold text-base py-4 rounded-2xl transition-all"
            >
              {loading ? "Generating questions…" : "Start Interview →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Interview / Feedback screen ───────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <TabSwitchWarning
        strikeCount={strikeCount}
        onDismiss={dismissWarning}
        visible={showWarningModal}
      />
      <Navbar
        variant="inner"
        sessionLabel={`${setup.domain} · ${setup.experience} · ${setup.companyType}`}
        progress={{ current, total: TOTAL }}
      />
      <div className="max-w-[800px] mx-auto px-6 py-20">

        {/* Timer + protection bar */}
        {stage === "interview" && !evaluating && (
          <div className="flex items-center justify-between mb-6">
            <span className="flex items-center gap-1.5" style={{
              padding: "5px 10px",
              borderRadius: "99px",
              background: "rgba(0,200,150,0.06)",
              border: "1px solid rgba(0,200,150,0.15)",
              fontSize: "11px",
              fontWeight: 600,
              color: "#00A07A",
              fontFamily: "var(--font-inter)",
            }}>
              <ShieldCheck size={12} color="#00A07A" />
              Session Protected
            </span>
            <div className="flex items-center gap-2" style={{
              padding: "6px 14px",
              borderRadius: "99px",
              background: "rgba(0,0,0,0.03)",
              border: "1px solid rgba(0,0,0,0.06)",
              fontSize: "14px",
              fontWeight: 600,
              color: "#0A0A0F",
              fontFamily: "var(--font-inter)",
            }}>
              <Clock size={14} color="#6B7280" />
              {timerDisplay}
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
                <p className="font-inter text-muted text-sm">Evaluating your answer…</p>
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
                  Question {current} of {TOTAL} — submitted
                </p>
              </div>

              {aiDetected?.isAI ? (
                <div className="mt-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-6">
                  <span className="text-red-500 text-2xl">⚠️</span>
                  <div>
                    <p className="font-inter font-bold text-base text-red-700">
                      AI-generated answer detected ({aiDetected.confidence}% confidence)
                    </p>
                    <p className="font-inter text-sm text-red-600 mt-1 mb-4">
                      {aiDetected.reason}
                    </p>
                    <p className="font-inter text-sm text-red-700 font-medium">
                      Please write your own answer to get feedback and score.
                    </p>
                    <button
                      onClick={() => { setStage("interview"); setAiDetected(null); }}
                      className="mt-4 bg-red-600 hover:bg-red-700 text-white font-inter font-semibold text-sm px-6 py-3 rounded-xl transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                <FeedbackPanel feedback={feedback} onNext={handleNext} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Strike indicator */}
        {strikeCount > 0 && (
          <div className="flex items-center justify-center mt-6">
            <span style={{
              fontSize: "12px",
              fontWeight: 600,
              color: strikeCount >= 2 ? "#CC4422" : "#996600",
              padding: "4px 12px",
              borderRadius: "99px",
              background: strikeCount >= 2 ? "rgba(255,107,61,0.08)" : "rgba(255,190,61,0.08)",
              border: `1px solid ${strikeCount >= 2 ? "rgba(255,107,61,0.15)" : "rgba(255,190,61,0.15)"}`,
              fontFamily: "var(--font-inter)",
            }}>
              ⚠ {strikeCount} tab switch{strikeCount > 1 ? "es" : ""} detected
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
