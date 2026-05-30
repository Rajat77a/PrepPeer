"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import LoginGlow from "@/components/ui/login-glow";

type AuthStep = 0 | 1 | 2;
type AuthMode = "login" | "signup";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [step, setStep] = useState<AuthStep>(0);
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSignup = mode === "signup";

  const cleanError = (message: string) => {
    if (message.toLowerCase().includes("signups not allowed")) {
      return "Email sign-up is not enabled yet.";
    }
    return message;
  };

  const handleGoogleLogin = async () => {
    setError("");
    const supabase = createClient();
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (googleError) setError(cleanError(googleError.message));
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: isSignup,
      },
    });
    setLoading(false);

    if (otpError) {
      setError(cleanError(otpError.message));
      return;
    }

    setOtp(["", "", "", "", "", ""]);
    setStep(1);
    setTimeout(() => otpRefs.current[0]?.focus(), 120);
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < otp.length - 1) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const token = otp.join("");
    if (token.length !== 6) return;
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token,
      type: "email",
    });
    setLoading(false);

    if (verifyError) {
      setError(cleanError(verifyError.message));
      return;
    }

    setStep(2);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#080808] px-4 py-10">
      <LoginGlow />

      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,108,255,0.12),transparent_28%)]" />

      <div className="relative z-10 w-full max-w-[480px] overflow-hidden rounded-2xl border border-[#006cff]/20 bg-gradient-to-br from-[#1a2a4a] via-[#0d1929] to-[#080808] shadow-[0_28px_90px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[length:18px_18px] opacity-30" />

        <div className="relative p-10">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="mb-6 font-inter text-lg font-semibold text-white">
                  PrepPeer
                </p>

                <h1 className="mb-8 font-inter text-3xl font-bold text-white">
                  {isSignup ? "Create your PrepPeer account" : "Sign in to PrepPeer"}
                </h1>

                <label className="mb-2 block font-inter text-sm text-white/50">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mb-4 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 font-inter text-white outline-none transition placeholder:text-white/20 focus:border-[#006cff]/50"
                />

                <button
                  onClick={handleEmailSubmit}
                  disabled={loading}
                  className="mb-6 w-full rounded-lg py-3 font-inter font-semibold text-white transition-all disabled:opacity-50"
                  style={{
                    background: "linear-gradient(90deg, #006cff, #38bdf8, #006cff)",
                    boxShadow: "0 0 24px rgba(0,108,255,0.45)",
                  }}
                >
                  {loading ? "SENDING..." : isSignup ? "SIGN UP" : "LOG IN"}
                </button>

                <div className="mb-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="font-inter text-xs tracking-widest text-white/30">
                    OR
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <button
                  onClick={handleGoogleLogin}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-black/40 py-3 font-inter text-white transition hover:bg-white/5"
                >
                  <GoogleIcon />
                  Sign in with Google
                </button>

                {error && (
                  <p className="mt-4 font-inter text-sm text-[#f87171]">{error}</p>
                )}
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <button
                  onClick={() => setStep(0)}
                  className="mb-8 flex items-center gap-2 font-inter text-sm text-white/40 transition hover:text-white"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <h1 className="mb-2 font-inter text-3xl font-bold text-white">
                  Check your email
                </h1>
                <p className="mb-8 font-inter text-sm text-white/40">
                  We sent a 6-digit code to{" "}
                  <span className="text-white/70">{email}</span>
                </p>

                <div className="mb-6 flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        otpRefs.current[index] = element;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(event) => handleOtpChange(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(index, event)}
                      className="h-14 w-12 rounded-lg border border-white/10 bg-black/40 text-center font-inter text-xl font-bold text-white outline-none transition focus:border-[#006cff]"
                      style={
                        digit
                          ? { boxShadow: "0 0 12px rgba(0,108,255,0.3)" }
                          : undefined
                      }
                    />
                  ))}
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.some((digit) => !digit)}
                  className="mb-4 w-full rounded-lg py-3 font-inter font-semibold text-white transition-all disabled:opacity-40"
                  style={{
                    background: "linear-gradient(90deg, #006cff, #38bdf8, #006cff)",
                    boxShadow: "0 0 24px rgba(0,108,255,0.45)",
                  }}
                >
                  {loading ? "VERIFYING..." : "Verify Code"}
                </button>

                <button
                  onClick={handleEmailSubmit}
                  className="font-inter text-sm text-white/30 transition hover:text-white/50"
                >
                  Resend code
                </button>

                {error && (
                  <p className="mt-4 font-inter text-sm text-[#f87171]">{error}</p>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#006cff]/40 bg-[#006cff]/20 text-[#38bdf8]"
                >
                  <Check size={28} strokeWidth={2.5} />
                </motion.div>
                <h1 className="mb-2 font-inter text-3xl font-bold text-white">
                  You&apos;re in!
                </h1>
                <p className="mb-8 font-inter text-white/40">
                  Redirecting to your dashboard...
                </p>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full rounded-lg py-3 font-inter font-semibold text-white"
                  style={{
                    background: "linear-gradient(90deg, #006cff, #38bdf8)",
                    boxShadow: "0 0 24px rgba(0,108,255,0.45)",
                  }}
                >
                  Go to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="relative z-10 mt-6 font-inter text-sm text-white/40">
        {isSignup ? "Already have an account?" : "Don&apos;t have an account?"}{" "}
        <button
          onClick={() => {
            setMode(isSignup ? "login" : "signup");
            setStep(0);
            setOtp(["", "", "", "", "", ""]);
            setError("");
          }}
          className="text-white/70 transition hover:text-white"
        >
          {isSignup ? "Log in" : "Sign up"}
        </button>
      </p>

      <div className="relative z-10 mt-8 flex gap-6 font-inter text-xs text-white/20">
        <a href="/privacy" className="transition hover:text-white/40">
          Privacy policy
        </a>
        <a href="/terms" className="transition hover:text-white/40">
          Terms of Use
        </a>
      </div>
    </main>
  );
}
