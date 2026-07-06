"use client";

import { ArrowRight, Check, ChevronRight, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { csrfHeaders } from "@/utils/csrf";

type OnboardingFormProps = {
  initialName: string;
  initialCollege: string;
  postSubmitPath?: string;
};

type SelectorKey = "experience";

const selectorFields: {
  id: SelectorKey;
  label: string;
  title: string;
  description: string;
  options: string[];
}[] = [
  {
    id: "experience",
    label: "Experience level",
    title: "Choose experience level",
    description: "This helps PrepPeer set the right difficulty and expectations.",
    options: [
      "Fresher",
      "0-1 years",
      "1-3 years",
      "3-6 years",
      "6+ years",
      "Senior (7+ Years)",
    ],
  },
];

export function OnboardingForm({
  initialName,
  initialCollege,
  postSubmitPath,
}: OnboardingFormProps) {
  const router = useRouter();

  const [fullName, setFullName] = useState(initialName);
  const [college, setCollege] = useState(initialCollege);
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("0-1 years");
  const [company, setCompany] = useState("");
  const [activeSelector, setActiveSelector] = useState<SelectorKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeSelectorConfig = selectorFields.find(
    (field) => field.id === activeSelector
  );

  const selectedValues = { experience };

  const canSubmit =
    fullName.trim().length >= 2 &&
    college.trim().length >= 2 &&
    role.trim().length >= 2 &&
    experience.trim().length > 0 &&
    company.trim().length >= 2;

  const setSelectorValue = (key: SelectorKey, value: string) => {
    if (key === "experience") setExperience(value);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: csrfHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        fullName,
        college,
        role: role.trim(),
        experience,
        company: company.trim(),
      }),
    });
    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      setError(result.error ?? "Profile could not be saved.");
      return;
    }

    const nextPath =
      sessionStorage.getItem("preppeer_post_onboarding_next") ??
      postSubmitPath ??
      "/dashboard";
    sessionStorage.removeItem("preppeer_post_onboarding_next");

    router.replace(nextPath);
    router.refresh();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-[#07111f]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,132,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(0,132,255,0.055)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[520px] w-[520px] rounded-full bg-[#0084ff]/12 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-[-20%] right-[-8%] h-[620px] w-[620px] rounded-full bg-[#38bdf8]/16 blur-[130px]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
        <Logo size="md" />
        <span className="rounded-full border border-[#cfe7ff] bg-white/70 px-4 py-2 font-inter text-sm font-bold text-[#64748b] shadow-[0_12px_40px_rgba(0,108,255,0.08)] backdrop-blur-xl">
          Account setup
        </span>
      </header>

      <section className="relative z-10 flex min-h-[calc(100vh-110px)] items-center justify-center px-5 pb-12">
        <motion.form
          onSubmit={saveProfile}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-[680px] rounded-[34px] border border-white/80 bg-white/72 p-6 text-center shadow-[0_30px_110px_rgba(0,108,255,0.16),inset_0_1px_2px_rgba(255,255,255,0.96)] backdrop-blur-2xl sm:p-9"
        >
          <p className="font-inter text-xs font-black uppercase tracking-[0.24em] text-[#0084ff]">
            Finish your profile
          </p>

          <h1 className="mt-4 font-inter text-[clamp(42px,7vw,76px)] font-black leading-[0.92] tracking-[-0.06em] text-[#07111f]">
            Tell us who is preparing.
          </h1>

          <p className="mx-auto mt-5 max-w-[500px] font-inter text-lg font-medium leading-7 text-[#64748b]">
            These details help PrepPeer generate sharper interview questions for
            your first session.
          </p>

          <div className="mt-9 space-y-4 text-left">
            <label className="block">
              <span className="font-inter text-xs font-black uppercase tracking-[0.16em] text-[#64748b]">
                Full name <span className="text-[#dc2626]">*</span>
              </span>
              <input
                value={fullName}
                onChange={(event) => {
                  setError("");
                  setFullName(event.target.value);
                }}
                placeholder="Rajat Krishnan"
                autoComplete="name"
                minLength={2}
                maxLength={80}
                className="mt-2 h-14 w-full rounded-2xl border border-[#d8ebff] bg-white/80 px-5 font-inter text-base font-bold text-[#07111f] outline-none transition placeholder:text-[#a5b4c8] focus:border-[#0084ff]/70 focus:shadow-[0_0_0_4px_rgba(0,132,255,0.12)]"
              />
            </label>

            <label className="block">
              <span className="font-inter text-xs font-black uppercase tracking-[0.16em] text-[#64748b]">
                Target role <span className="text-[#dc2626]">*</span>
              </span>
              <input
                value={role}
                onChange={(event) => {
                  setError("");
                  setRole(event.target.value);
                }}
                placeholder="e.g. Backend Engineer, MBA Marketing, Data Analyst"
                autoComplete="organization-title"
                minLength={2}
                maxLength={80}
                className="mt-2 h-14 w-full rounded-2xl border border-[#d8ebff] bg-white/80 px-5 font-inter text-base font-bold text-[#07111f] outline-none transition placeholder:text-[#a5b4c8] focus:border-[#0084ff]/70 focus:shadow-[0_0_0_4px_rgba(0,132,255,0.12)]"
              />
            </label>

            <label className="block">
              <span className="font-inter text-xs font-black uppercase tracking-[0.16em] text-[#64748b]">
                Current Occupation <span className="text-[#dc2626]">*</span>
              </span>
              <input
                value={college}
                onChange={(event) => {
                  setError("");
                  setCollege(event.target.value);
                }}
                placeholder="e.g. Software Engineer at Google"
                autoComplete="organization"
                minLength={2}
                maxLength={120}
                className="mt-2 h-14 w-full rounded-2xl border border-[#d8ebff] bg-white/80 px-5 font-inter text-base font-bold text-[#07111f] outline-none transition placeholder:text-[#a5b4c8] focus:border-[#0084ff]/70 focus:shadow-[0_0_0_4px_rgba(0,132,255,0.12)]"
              />
            </label>

            {selectorFields.map((field) => (
              <div key={field.id}>
                <span className="font-inter text-xs font-black uppercase tracking-[0.16em] text-[#64748b]">
                  {field.label} <span className="text-[#dc2626]">*</span>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setActiveSelector(field.id);
                  }}
                  className="mt-2 flex h-14 w-full items-center justify-between rounded-2xl border border-[#d8ebff] bg-white/80 px-5 text-left font-inter text-base font-bold text-[#07111f] outline-none transition hover:border-[#0084ff]/60 hover:bg-white hover:shadow-[0_0_0_4px_rgba(0,132,255,0.08)]"
                >
                  <span>{selectedValues[field.id]}</span>
                  <ChevronRight className="h-5 w-5 text-[#64748b]" />
                </button>
              </div>
            ))}

            <label className="block">
              <span className="font-inter text-xs font-black uppercase tracking-[0.16em] text-[#64748b]">
                Target company type <span className="text-[#dc2626]">*</span>
              </span>
              <input
                value={company}
                onChange={(event) => {
                  setError("");
                  setCompany(event.target.value);
                }}
                placeholder="e.g. Fintech startup, FAANG, Consulting firm"
                autoComplete="organization"
                minLength={2}
                maxLength={80}
                className="mt-2 h-14 w-full rounded-2xl border border-[#d8ebff] bg-white/80 px-5 font-inter text-base font-bold text-[#07111f] outline-none transition placeholder:text-[#a5b4c8] focus:border-[#0084ff]/70 focus:shadow-[0_0_0_4px_rgba(0,132,255,0.12)]"
              />
            </label>
          </div>

          {error && (
            <p className="mt-5 font-inter text-sm font-semibold text-[#dc2626]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#0084ff] px-6 font-inter text-base font-black text-white shadow-[0_20px_54px_rgba(0,132,255,0.28)] transition hover:-translate-y-0.5 hover:bg-[#006cff] disabled:translate-y-0 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Continue to dashboard
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </motion.form>
      </section>

      <AnimatePresence>
        {activeSelectorConfig && (
          <motion.div
            className="fixed inset-0 z-[80] flex justify-end bg-[#07111f]/35 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveSelector(null)}
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(event) => event.stopPropagation()}
              className="h-full w-full max-w-md overflow-y-auto border-l border-[rgba(0,132,255,0.18)] bg-white p-6 shadow-[-24px_0_80px_rgba(0,108,255,0.18)]"
            >
              <div className="mb-8 flex items-start justify-between gap-5">
                <div>
                  <p className="font-inter text-xs font-bold uppercase tracking-[0.2em] text-[#006cff]">
                    Account setup
                  </p>
                  <h2 className="mt-3 font-inter text-2xl font-black tracking-[-0.04em] text-[#07111f]">
                    {activeSelectorConfig.title}
                  </h2>
                  <p className="mt-2 font-inter text-sm font-semibold leading-6 text-[#64748b]">
                    {activeSelectorConfig.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveSelector(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(0,132,255,0.14)] bg-[#f7fbff] text-[#64748b] transition hover:border-[#006cff]/35 hover:text-[#006cff]"
                  aria-label="Close selector"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-3">
                {activeSelectorConfig.options.map((option) => {
                  const selected =
                    selectedValues[activeSelectorConfig.id] === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setSelectorValue(activeSelectorConfig.id, option);
                        setActiveSelector(null);
                      }}
                      className={
                        selected
                          ? "flex min-h-14 items-center justify-between rounded-2xl border border-[#006cff] bg-[#006cff] px-5 py-3 text-left font-inter text-sm font-black text-white shadow-[0_14px_34px_rgba(0,108,255,0.20)]"
                          : "flex min-h-14 items-center justify-between rounded-2xl border border-[rgba(0,132,255,0.12)] bg-[#f7fbff] px-5 py-3 text-left font-inter text-sm font-bold text-[#07111f] transition hover:border-[#006cff]/45 hover:bg-white hover:text-[#006cff]"
                      }
                    >
                      <span>{option}</span>
                      {selected && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
