"use client";

import { ArrowLeft, ArrowRight, Check, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Logo } from "@/components/ui/Logo";
import { CanvasRevealEffect } from "@/components/ui/sign-in-flow-1";
import { AnimatedInputOTP } from "@/components/ui/input-otp";
import { AssistedPasswordConfirmation } from "@/components/ui/assisted-password-confirmation";

type LoginStep = 0 | 1 | 2 | 3 | 4;

const panelMotion = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -80 },
  transition: { duration: 0.42, ease: "easeOut" },
} as const;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#fff"
        d="M21.6 12.23c0-.72-.06-1.24-.18-1.78H12v3.24h5.52c-.11.8-.71 2.01-2.04 2.82l-.02.11 2.96 2.01.2.02c1.84-1.49 2.98-3.7 2.98-6.42Z"
      />
      <path
        fill="#fff"
        opacity=".86"
        d="M12 22c2.63 0 4.84-.76 6.45-2.08l-3.07-2.08c-.82.5-1.92.85-3.38.85a5.85 5.85 0 0 1-5.54-3.55l-.12.01-3.08 2.1-.04.1A9.97 9.97 0 0 0 12 22Z"
      />
      <path
        fill="#fff"
        opacity=".72"
        d="M6.46 15.14A5.4 5.4 0 0 1 6.15 12c0-1.09.2-2.15.31-3.14l-.01-.12-3.12-2.14-.1.04A9.35 9.35 0 0 0 2 12c0 1.92.49 3.73 1.35 5.31l3.11-2.17Z"
      />
      <path
        fill="#fff"
        opacity=".58"
        d="M12 5.31c1.83 0 3.06.7 3.76 1.28l2.75-2.35C16.82 2.86 14.63 2 12 2a9.97 9.97 0 0 0-8.78 5.36l3.24 2.5A5.88 5.88 0 0 1 12 5.31Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reverseCanvas, setReverseCanvas] = useState(false);

  const signInWithGoogle = async () => {
    setError("");
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (signInError) setError(signInError.message);
  };

  const sendOtp = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
    });
    setLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }
    setStep(2);
  };

  const verifyOtp = async (code: string) => {
    setLoading(true);
    setError("");
    setReverseCanvas(true);
    const supabase = createClient();
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: "email",
    });
    setLoading(false);

    if (verifyError) {
      setReverseCanvas(false);
      setError(verifyError.message);
      return;
    }

    const createdAt = data.user?.created_at ? new Date(data.user.created_at).getTime() : 0;
    const lastSignIn = data.user?.last_sign_in_at
      ? new Date(data.user.last_sign_in_at).getTime()
      : 0;
    const isNewUser = createdAt > 0 && lastSignIn > 0 && Math.abs(lastSignIn - createdAt) < 15000;

    if (isNewUser) {
      setStep(3);
      return;
    }

    router.push("/dashboard");
  };

  const savePassword = async (password: string) => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: passwordError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (passwordError) {
      setError(passwordError.message);
      return;
    }
    setStep(4);
  };

  useEffect(() => {
    if (step !== 2 || otp.length !== 6 || loading) return;
    void verifyOtp(otp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, step]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#080808] text-white">
      {step > 0 && <CanvasRevealEffect reverse={reverseCanvas || step === 4} />}

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        <section className="relative flex min-h-[42vh] items-center overflow-hidden p-6 sm:p-10 lg:min-h-screen">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#080808] via-[#080808]/72 to-[#006cff]/10" />
          <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-black/40 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-8">
            <Logo variant="light" size="md" />
            <h1 className="mt-16 font-fustat text-[clamp(42px,6vw,76px)] font-extrabold leading-[0.95]">
              Know your rank. Own your prep.
            </h1>
            <p className="mt-5 max-w-md font-inter text-lg leading-8 text-[#9ca3af]">
              Join thousands of students preparing smarter.
            </p>
          </div>
        </section>

        <section className="relative flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-[0_24px_90px_rgba(0,0,0,0.38)] backdrop-blur-md">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="choice"
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.42, ease: "easeOut" }}
                >
                  <h2 className="font-fustat text-4xl font-extrabold">Welcome back</h2>
                  <p className="mt-2 font-inter text-sm text-[#9ca3af]">
                    Choose how you want to sign in
                  </p>

                  <div className="mt-8 space-y-3">
                    <button
                      onClick={signInWithGoogle}
                      className="flex w-full items-center justify-center gap-3 rounded-full bg-[#006cff] px-5 py-3.5 font-inter text-sm font-bold text-white transition hover:bg-[#0b7cff]"
                    >
                      <GoogleIcon />
                      Continue with Google
                    </button>
                    <div className="flex items-center gap-3 py-3">
                      <span className="h-px flex-1 bg-white/10" />
                      <span className="font-inter text-xs text-white/30">or</span>
                      <span className="h-px flex-1 bg-white/10" />
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3.5 font-inter text-sm font-bold text-white transition hover:bg-white/10"
                    >
                      <Mail size={17} />
                      Continue with Email
                    </button>
                  </div>

                  {error && <p className="mt-4 font-inter text-sm text-[#f87171]">{error}</p>}
                  <p className="mt-8 text-center font-inter text-xs leading-5 text-white/30">
                    By continuing, you agree to PrepPeer&apos;s terms and privacy policy.
                  </p>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="email" {...panelMotion}>
                  <button
                    onClick={() => setStep(0)}
                    className="mb-6 flex items-center gap-2 font-inter text-sm font-semibold text-white/50 transition hover:text-white"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  <h2 className="font-fustat text-4xl font-extrabold">Enter your email</h2>
                  <p className="mt-2 font-inter text-sm text-[#9ca3af]">
                    We&apos;ll send a 6 digit sign-in code.
                  </p>
                  <form
                    className="mt-8"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void sendOtp();
                    }}
                  >
                    <div className="flex rounded-full border border-white/10 bg-white/[0.06] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="min-w-0 flex-1 bg-transparent px-4 font-inter text-sm text-white outline-none placeholder:text-white/25"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#006cff] text-white transition hover:bg-[#0b7cff] disabled:opacity-50"
                      >
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </form>
                  {error && <p className="mt-4 font-inter text-sm text-[#f87171]">{error}</p>}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="otp" {...panelMotion}>
                  <button
                    onClick={() => {
                      setOtp("");
                      setReverseCanvas(false);
                      setStep(1);
                    }}
                    className="mb-6 flex items-center gap-2 font-inter text-sm font-semibold text-white/50 transition hover:text-white"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  <h2 className="font-fustat text-4xl font-extrabold">Check your inbox</h2>
                  <p className="mt-2 font-inter text-sm text-[#9ca3af]">
                    Enter the code sent to {email}.
                  </p>
                  <div className="mt-8">
                    <AnimatedInputOTP value={otp} onChange={setOtp} disabled={loading} />
                  </div>
                  <button
                    onClick={sendOtp}
                    className="mt-6 font-inter text-sm font-bold text-[#006cff] transition hover:text-[#4da0ff]"
                  >
                    Resend code
                  </button>
                  {error && <p className="mt-4 font-inter text-sm text-[#f87171]">{error}</p>}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="password" {...panelMotion}>
                  <h2 className="font-fustat text-4xl font-extrabold">Secure your account</h2>
                  <p className="mt-2 font-inter text-sm text-[#9ca3af]">
                    Create a password for faster access next time.
                  </p>
                  <div className="mt-8">
                    <AssistedPasswordConfirmation
                      onSubmit={savePassword}
                      loading={loading}
                      error={error}
                    />
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.42, ease: "easeOut" }}
                  className="text-center"
                >
                  <motion.div
                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#16a34a]/30 bg-[#16a34a]/20 text-[#4ade80]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  >
                    <Check size={34} strokeWidth={2.8} />
                  </motion.div>
                  <h2 className="mt-6 font-fustat text-4xl font-extrabold">You&apos;re in!</h2>
                  <p className="mt-2 font-inter text-sm text-[#9ca3af]">
                    Your PrepPeer dashboard is ready.
                  </p>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="mt-8 w-full rounded-full bg-[#006cff] px-5 py-3.5 font-inter text-sm font-bold text-white transition hover:bg-[#0b7cff]"
                  >
                    Continue to Dashboard
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </main>
  );
}
