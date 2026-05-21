"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { FeedbackPanel } from "@/components/interview/FeedbackPanel";
import { MOCK_FEEDBACK } from "@/lib/mockData";

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
  const [setup, setSetup] = useState<SetupData>({
    domain: "",
    experience: "",
    companyType: "",
  });

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

  const handleSubmit = () => setStage("feedback");

  const handleNext = () => {
    if (current >= TOTAL) {
      router.push("/results");
    } else {
      setCurrent((c) => c + 1);
      setStage("interview");
    }
  };

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
            {/* Domain */}
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

            {/* Experience */}
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

            {/* Company Type */}
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        variant="inner"
        sessionLabel={`${setup.domain} · ${setup.experience} · ${setup.companyType}`}
        progress={{ current, total: TOTAL }}
      />
      <div className="max-w-[800px] mx-auto px-6 py-20">
        {stage === "interview" ? (
          <QuestionCard
            questionNumber={current}
            totalQuestions={TOTAL}
            question={questions[current - 1]}
            onSubmit={handleSubmit}
          />
        ) : (
          <>
            <div className="rounded-3xl p-10 bg-white border border-[rgba(0,132,255,0.15)] opacity-60">
              <p className="font-inter text-sm text-muted mb-2">
                Question {current} of {TOTAL} — submitted
              </p>
            </div>
            <FeedbackPanel feedback={MOCK_FEEDBACK} onNext={handleNext} />
          </>
        )}
      </div>
    </div>
  );
}
