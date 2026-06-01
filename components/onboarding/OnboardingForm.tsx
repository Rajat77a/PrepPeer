"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/utils/supabase/client";

type OnboardingFormProps = {
  initialName: string;
  initialCollege: string;
  postSubmitPath?: string;
};

export function OnboardingForm({
  initialName,
  initialCollege,
  postSubmitPath,
}: OnboardingFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialName);
  const [college, setCollege] = useState(initialCollege);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = fullName.trim().length >= 2 && college.trim().length >= 2;

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
        name: fullName.trim(),
        college: college.trim(),
        onboarding_complete: true,
      },
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    const nextPath =
      sessionStorage.getItem("preppeer_post_onboarding_next") ??
      postSubmitPath ??
      "/dashboard/profile";
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
          className="w-full max-w-[620px] rounded-[34px] border border-white/80 bg-white/72 p-6 text-center shadow-[0_30px_110px_rgba(0,108,255,0.16),inset_0_1px_2px_rgba(255,255,255,0.96)] backdrop-blur-2xl sm:p-9"
        >
          <p className="font-inter text-xs font-black uppercase tracking-[0.24em] text-[#0084ff]">
            Finish your profile
          </p>
          <h1 className="mt-4 font-inter text-[clamp(42px,7vw,76px)] font-black leading-[0.92] tracking-[-0.06em] text-[#07111f]">
            Tell us who is preparing.
          </h1>
          <p className="mx-auto mt-5 max-w-[460px] font-inter text-lg font-medium leading-7 text-[#64748b]">
            This keeps your dashboard and account page personal to you.
          </p>

          <div className="mt-9 space-y-4 text-left">
            <label className="block">
              <span className="font-inter text-xs font-black uppercase tracking-[0.16em] text-[#64748b]">
                Full name
              </span>
              <input
                value={fullName}
                onChange={(event) => {
                  setError("");
                  setFullName(event.target.value);
                }}
                placeholder="Rajat Krishnan"
                autoComplete="name"
                className="mt-2 h-14 w-full rounded-2xl border border-[#d8ebff] bg-white/80 px-5 font-inter text-base font-bold text-[#07111f] outline-none transition placeholder:text-[#a5b4c8] focus:border-[#0084ff]/70 focus:shadow-[0_0_0_4px_rgba(0,132,255,0.12)]"
              />
            </label>

            <label className="block">
              <span className="font-inter text-xs font-black uppercase tracking-[0.16em] text-[#64748b]">
                College
              </span>
              <input
                value={college}
                onChange={(event) => {
                  setError("");
                  setCollege(event.target.value);
                }}
                placeholder="Your college or university"
                autoComplete="organization"
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
                Continue to account
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </motion.form>
      </section>
    </main>
  );
}
