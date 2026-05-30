"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Home,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Logo } from "@/components/ui/Logo";
import { CanvasRevealEffect } from "@/components/ui/sign-in-flow-1";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { AssistedPasswordConfirmation } from "@/components/ui/assisted-password-confirmation";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup";
type AuthStep = "choice" | "email" | "otp" | "password" | "success";

const panelMotion = {
  initial: { opacity: 0, y: 22, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -18, filter: "blur(10px)" },
  transition: { duration: 0.38, ease: "easeOut" },
} as const;

const modeCopy = {
  signin: {
    eyebrow: "Return to your rank room",
    headline: "Welcome back to PrepPeer",
    subline: "Your interviews, scores, and rank movement are waiting.",
    title: "Sign in with OTP",
    body: "Use a one-time code to reopen your dashboard.",
    action: "Send sign-in code",
  },
  signup: {
    eyebrow: "Start your rank story",
    headline: "Build your interview base",
    subline: "Create your account, verify the email, then lock it with a password.",
    title: "Sign up with OTP",
    body: "Verify your email first, then set your password with the live matching prompt.",
    action: "Send sign-up code",
  },
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.6 12.23c0-.72-.06-1.24-.18-1.78H12v3.24h5.52c-.11.8-.71 2.01-2.04 2.82l-.02.11 2.96 2.01.2.02c1.84-1.49 2.98-3.7 2.98-6.42Z"
      />
      <path
        fill="currentColor"
        opacity=".78"
        d="M12 22c2.63 0 4.84-.76 6.45-2.08l-3.07-2.08c-.82.5-1.92.85-3.38.85a5.85 5.85 0 0 1-5.54-3.55l-.12.01-3.08 2.1-.04.1A9.97 9.97 0 0 0 12 22Z"
      />
      <path
        fill="currentColor"
        opacity=".54"
        d="M6.46 15.14A5.4 5.4 0 0 1 6.15 12c0-1.09.2-2.15.31-3.14l-.01-.12-3.12-2.14-.1.04A9.35 9.35 0 0 0 2 12c0 1.92.49 3.73 1.35 5.31l3.11-2.17Z"
      />
      <path
        fill="currentColor"
        opacity=".36"
        d="M12 5.31c1.83 0 3.06.7 3.76 1.28l2.75-2.35C16.82 2.86 14.63 2 12 2a9.97 9.97 0 0 0-8.78 5.36l3.24 2.5A5.88 5.88 0 0 1 12 5.31Z"
      />
    </svg>
  );
}

function FloatingAuthNav({
  mode,
  onModeChange,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}) {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex items-start justify-between px-5 py-5 sm:px-8">
      <Logo variant="light" size="md" />

      <nav className="absolute left-1/2 top-5 hidden -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-white/[0.055] px-4 py-3 shadow-[0_22px_70px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:flex">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white"
          aria-label="Home"
        >
          <Home size={17} />
        </Link>
        <span className="h-6 w-px bg-white/10" />
        <button
          onClick={() => onModeChange("signin")}
          className={cn(
            "rounded-full px-5 py-2.5 font-inter text-sm font-bold transition",
            mode === "signin"
              ? "bg-[#006cff] text-white shadow-[0_12px_34px_rgba(0,108,255,0.36)]"
              : "text-white/50 hover:bg-white/10 hover:text-white"
          )}
        >
          Sign in
        </button>
        <button
          onClick={() => onModeChange("signup")}
          className={cn(
            "rounded-full px-5 py-2.5 font-inter text-sm font-bold transition",
            mode === "signup"
              ? "bg-white text-black shadow-[0_0_38px_rgba(255,255,255,0.25)]"
              : "text-white/50 hover:bg-white/10 hover:text-white"
          )}
        >
          Sign up
        </button>
      </nav>

      <div className="flex rounded-full border border-white/10 bg-white/[0.055] p-1 backdrop-blur-xl sm:hidden">
        {(["signin", "signup"] as const).map((item) => (
          <button
            key={item}
            onClick={() => onModeChange(item)}
            className={cn(
              "rounded-full px-3 py-1.5 font-inter text-xs font-bold transition",
              mode === item ? "bg-[#006cff] text-white" : "text-white/45"
            )}
          >
            {item === "signin" ? "Sign in" : "Sign up"}
          </button>
        ))}
      </div>
    </header>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>("choice");
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reverseCanvas, setReverseCanvas] = useState(false);

  const activeCopy = modeCopy[mode];
  const isSignUp = mode === "signup";

  const statusText = useMemo(() => {
    if (step === "choice") return "Google or email OTP";
    if (step === "email") return isSignUp ? "New account code" : "Returning account code";
    if (step === "otp") return "Six digit verification";
    if (step === "password") return "Password match";
    return "Dashboard unlocked";
  }, [isSignUp, step]);

  const resetForMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setStep("choice");
    setOtp("");
    setError("");
    setReverseCanvas(false);
  };

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

  const friendlyAuthError = (message: string) => {
    if (message.toLowerCase().includes("signups not allowed")) {
      return "Email sign-up is not enabled in Supabase yet. Turn on email signups to use this path.";
    }
    return message;
  };

  const sendOtp = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: isSignUp,
      },
    });
    setLoading(false);

    if (otpError) {
      setError(friendlyAuthError(otpError.message));
      return;
    }
    setStep("otp");
  };

  const verifyOtp = async (code: string) => {
    setLoading(true);
    setError("");
    setReverseCanvas(true);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: "email",
    });
    setLoading(false);

    if (verifyError) {
      setReverseCanvas(false);
      setError(friendlyAuthError(verifyError.message));
      return;
    }

    if (isSignUp) {
      setStep("password");
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
      setError(friendlyAuthError(passwordError.message));
      return;
    }
    setStep("success");
  };

  useEffect(() => {
    if (step !== "otp" || otp.length !== 6 || loading) return;
    void verifyOtp(otp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, step]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <CanvasRevealEffect reverse={reverseCanvas || step === "success"} />
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_0%,rgba(0,108,255,0.2),transparent_34%),radial-gradient(circle_at_50%_62%,rgba(56,189,248,0.14),transparent_32%)]" />
      <div className="absolute inset-0 z-[1] opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,.11)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.11)_1px,transparent_1px)] [background-size:54px_54px]" />
      <div className="absolute inset-0 z-[2] bg-[linear-gradient(to_bottom,rgba(0,0,0,0.28),rgba(0,0,0,0.04)_28%,rgba(0,0,0,0.72)_100%)]" />

      <FloatingAuthNav mode={mode} onModeChange={resetForMode} />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-5 pb-10 pt-28 sm:px-8">
        <div className="w-full max-w-[620px] text-center">
          <motion.div
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#38bdf8]/25 bg-[#38bdf8]/10 px-4 py-2 font-inter text-xs font-bold uppercase tracking-[0.22em] text-[#7dd3fc] shadow-[0_0_42px_rgba(56,189,248,0.12)] backdrop-blur-xl"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <Sparkles size={14} />
            {statusText}
          </motion.div>

          <AnimatePresence mode="wait">
            {step === "choice" && (
              <motion.div key="choice" {...panelMotion}>
                <p className="font-inter text-sm font-bold uppercase tracking-[0.32em] text-[#38bdf8]">
                  {activeCopy.eyebrow}
                </p>
                <h1 className="mx-auto mt-4 max-w-[680px] font-fustat text-[clamp(48px,7vw,86px)] font-extrabold leading-[0.92] tracking-[-0.03em] text-white">
                  {activeCopy.headline}
                </h1>
                <p className="mx-auto mt-5 max-w-[520px] font-inter text-lg leading-8 text-white/52">
                  {activeCopy.subline}
                </p>

                <div className="mx-auto mt-10 max-w-[460px] space-y-4">
                  <button
                    onClick={signInWithGoogle}
                    className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full border border-white/10 bg-white/[0.065] px-5 py-4 font-inter text-base font-bold text-white shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl transition hover:border-[#38bdf8]/35 hover:bg-white/[0.09]"
                  >
                    <GoogleIcon />
                    Continue with Google
                    <span className="absolute inset-y-0 left-[-25%] w-[18%] skew-x-[-18deg] bg-white/24 blur-sm transition-transform duration-700 group-hover:translate-x-[720%]" />
                  </button>

                  <div className="flex items-center gap-4 py-1">
                    <span className="h-px flex-1 bg-white/10" />
                    <span className="font-inter text-sm font-bold text-white/30">or</span>
                    <span className="h-px flex-1 bg-white/10" />
                  </div>

                  <button
                    onClick={() => setStep("email")}
                    className="flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-[#06101d]/72 px-5 py-4 font-inter text-base font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl transition hover:border-[#38bdf8]/35 hover:bg-[#0a1c32]"
                  >
                    <Mail size={18} />
                    Continue with Email
                  </button>
                </div>

                {error && <p className="mt-5 font-inter text-sm text-[#f87171]">{error}</p>}
                <p className="mx-auto mt-12 max-w-[420px] font-inter text-xs leading-5 text-white/32">
                  Secure OTP access for PrepPeer rank history and dashboard data.
                </p>
              </motion.div>
            )}

            {step === "email" && (
              <motion.div key="email" {...panelMotion}>
                <button
                  onClick={() => setStep("choice")}
                  className="mx-auto mb-6 flex items-center gap-2 font-inter text-sm font-semibold text-white/48 transition hover:text-white"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <p className="font-inter text-sm font-bold uppercase tracking-[0.3em] text-[#38bdf8]">
                  {activeCopy.eyebrow}
                </p>
                <h1 className="mt-4 font-fustat text-[clamp(42px,6vw,70px)] font-extrabold leading-none">
                  {activeCopy.title}
                </h1>
                <p className="mx-auto mt-4 max-w-[460px] font-inter text-base leading-7 text-white/52">
                  {activeCopy.body}
                </p>
                <form
                  className="mx-auto mt-9 max-w-[460px] space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void sendOtp();
                  }}
                >
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="h-14 text-center text-base"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#0ea5e9] via-[#006cff] to-[#1d4ed8] px-5 py-4 font-inter text-base font-bold text-white shadow-[0_18px_55px_rgba(0,108,255,0.32)] transition hover:shadow-[0_24px_75px_rgba(56,189,248,0.32)] disabled:opacity-50"
                  >
                    {loading ? "Sending..." : activeCopy.action}
                    <ArrowRight size={18} />
                  </button>
                </form>
                {error && <p className="mt-5 font-inter text-sm text-[#f87171]">{error}</p>}
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div key="otp" {...panelMotion}>
                <button
                  onClick={() => {
                    setOtp("");
                    setReverseCanvas(false);
                    setStep("email");
                  }}
                  className="mx-auto mb-6 flex items-center gap-2 font-inter text-sm font-semibold text-white/48 transition hover:text-white"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <p className="font-inter text-sm font-bold uppercase tracking-[0.3em] text-[#38bdf8]">
                  Verification code
                </p>
                <h1 className="mt-4 font-fustat text-[clamp(42px,6vw,70px)] font-extrabold leading-none">
                  Check your inbox.
                </h1>
                <p className="mx-auto mt-4 max-w-[460px] font-inter text-base leading-7 text-white/52">
                  Enter the 6 digit code sent to {email}.
                </p>
                <div className="mx-auto mt-9 max-w-[460px] rounded-[28px] border border-white/10 bg-[#06101d]/56 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={loading}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="mx-auto mt-5 flex max-w-[460px] items-center justify-between gap-3">
                  <button
                    onClick={sendOtp}
                    disabled={loading}
                    className="font-inter text-sm font-bold text-[#38bdf8] transition hover:text-[#7dd3fc] disabled:opacity-50"
                  >
                    Resend code
                  </button>
                  <span className="font-inter text-xs text-white/35">
                    Auto-checks after 6 digits
                  </span>
                </div>
                {error && <p className="mt-5 font-inter text-sm text-[#f87171]">{error}</p>}
              </motion.div>
            )}

            {step === "password" && (
              <motion.div key="password" {...panelMotion} className="mx-auto max-w-[500px] text-left">
                <button
                  onClick={() => setStep("otp")}
                  className="mb-6 flex items-center gap-2 font-inter text-sm font-semibold text-white/48 transition hover:text-white"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#38bdf8]/20 bg-[#38bdf8]/10 text-[#7dd3fc]">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="font-inter text-xs font-bold uppercase tracking-[0.2em] text-[#38bdf8]">
                      Final account lock
                    </p>
                    <h1 className="font-fustat text-3xl font-extrabold">Create password</h1>
                  </div>
                </div>
                <AssistedPasswordConfirmation
                  onSubmit={savePassword}
                  loading={loading}
                  error={error}
                />
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 45, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <motion.div
                  className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#38bdf8]/30 bg-[#38bdf8]/10 text-[#7dd3fc] shadow-[0_0_70px_rgba(56,189,248,0.32)]"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 15 }}
                >
                  <Check size={38} strokeWidth={2.8} />
                </motion.div>
                <p className="mt-6 font-inter text-sm font-bold uppercase tracking-[0.24em] text-[#38bdf8]">
                  Account ready
                </p>
                <h1 className="mt-3 font-fustat text-[clamp(48px,7vw,82px)] font-extrabold leading-none">
                  You&apos;re in.
                </h1>
                <p className="mx-auto mt-4 max-w-[460px] font-inter text-base leading-7 text-white/52">
                  Your PrepPeer dashboard is ready to collect sessions, scores, and rank movement.
                </p>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="mt-9 w-full max-w-[460px] rounded-full bg-[#006cff] px-5 py-4 font-inter text-base font-bold text-white shadow-[0_18px_55px_rgba(0,108,255,0.32)] transition hover:bg-[#0b7cff]"
                >
                  Continue to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
