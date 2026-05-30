"use client";

import { ArrowLeft, ArrowRight, Check, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
  initial: { opacity: 0, x: 80, filter: "blur(10px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -60, filter: "blur(10px)" },
  transition: { duration: 0.42, ease: "easeOut" },
} as const;

const modeCopy = {
  signin: {
    eyebrow: "Return to your rank room",
    title: "Sign in with OTP",
    body: "Use your email code to reopen your PrepPeer dashboard.",
    action: "Send sign-in code",
  },
  signup: {
    eyebrow: "Create your PrepPeer account",
    title: "Sign up with OTP",
    body: "Verify your email first, then set your password with the live match animation.",
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

function RankScene() {
  const rows = [
    { label: "Session start", rank: "#67", width: "42%", tone: "bg-white/25" },
    { label: "After answer 3", rank: "#52", width: "64%", tone: "bg-[#38bdf8]" },
    { label: "Final chase", rank: "#41", width: "78%", tone: "bg-[#006cff]" },
  ];

  return (
    <div className="relative hidden min-h-screen overflow-hidden lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(56,189,248,0.18),transparent_34%),radial-gradient(circle_at_72%_68%,rgba(0,108,255,0.28),transparent_38%),#03070d]" />
      <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.14)_1px,transparent_1px)] [background-size:54px_54px]" />
      <div className="absolute left-10 top-10">
        <Logo variant="light" size="md" />
      </div>

      <div className="absolute left-[9%] top-[19%] w-[76%]">
        <motion.div
          className="rounded-[32px] border border-white/10 bg-black/35 p-8 shadow-[0_35px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p className="font-inter text-xs font-bold uppercase tracking-[0.28em] text-[#38bdf8]">
            PrepPeer login
          </p>
          <h1 className="mt-7 max-w-[720px] font-fustat text-[clamp(52px,6vw,92px)] font-extrabold leading-[0.9] text-white">
            Enter the room where your rank starts moving.
          </h1>
          <p className="mt-6 max-w-lg font-inter text-lg leading-8 text-white/58">
            Sign in with a code, build your profile, and keep every interview score tied to your next jump.
          </p>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-[9%] left-[14%] w-[58%] rounded-[28px] border border-white/10 bg-[#06101d]/80 p-5 shadow-[0_28px_100px_rgba(0,108,255,0.16)] backdrop-blur-xl"
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.18, ease: "easeOut" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <span className="font-inter text-sm font-bold text-white">
            Software Engineering · Fresher
          </span>
          <span className="rounded-full border border-[#38bdf8]/25 bg-[#38bdf8]/10 px-3 py-1 font-inter text-xs font-bold text-[#7dd3fc]">
            Live preview
          </span>
        </div>
        <div className="space-y-3">
          {rows.map((row, index) => (
            <motion.div
              key={row.label}
              className="grid grid-cols-[1fr_64px] items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              initial={{ opacity: 0, x: -22 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.42, delay: 0.34 + index * 0.1 }}
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-inter text-sm font-bold text-white/72">{row.label}</p>
                  <p className="font-inter text-xs font-bold text-white/[0.38]">{index === 0 ? "52" : index === 1 ? "64" : "72"}/100</p>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/[0.08]">
                  <motion.div
                    className={cn("h-full rounded-full", row.tone)}
                    initial={{ width: 0 }}
                    animate={{ width: row.width }}
                    transition={{ duration: 0.7, delay: 0.5 + index * 0.12, ease: "easeOut" }}
                  />
                </div>
              </div>
              <p className="font-fustat text-3xl font-extrabold text-white">{row.rank}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
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
    if (step === "choice") return "Choose Google or email OTP";
    if (step === "email") return isSignUp ? "Sign-up OTP requested next" : "Sign-in OTP requested next";
    if (step === "otp") return "Six digit verification";
    if (step === "password") return "Password match animation";
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
      setError(otpError.message);
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
      setError(verifyError.message);
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
      setError(passwordError.message);
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
    <main className="min-h-screen overflow-hidden bg-[#02060c] text-white">
      <CanvasRevealEffect reverse={reverseCanvas || step === "success"} />
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_78%_18%,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_48%_80%,rgba(0,108,255,0.12),transparent_32%)]" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <RankScene />

        <section className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
          <div className="absolute left-5 top-5 lg:hidden">
            <Logo variant="light" />
          </div>

          <motion.div
            className="w-full max-w-[470px] rounded-[30px] border border-white/10 bg-[#050b14]/78 p-5 shadow-[0_34px_110px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-7"
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="rounded-full border border-[#38bdf8]/20 bg-[#38bdf8]/10 px-3 py-1.5 font-inter text-[11px] font-bold uppercase tracking-[0.16em] text-[#7dd3fc]">
                {statusText}
              </div>
              <div className="flex rounded-full border border-white/10 bg-white/[0.04] p-1">
                {(["signin", "signup"] as const).map((item) => (
                  <button
                    key={item}
                    onClick={() => resetForMode(item)}
                    className={cn(
                      "rounded-full px-3 py-1.5 font-inter text-xs font-bold transition",
                      mode === item
                        ? "bg-[#006cff] text-white shadow-[0_10px_24px_rgba(0,108,255,0.28)]"
                        : "text-white/[0.42] hover:text-white"
                    )}
                  >
                    {item === "signin" ? "Sign in" : "Sign up"}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === "choice" && (
                <motion.div key="choice" {...panelMotion}>
                  <div className="mb-8">
                    <p className="font-inter text-xs font-bold uppercase tracking-[0.22em] text-[#38bdf8]">
                      {activeCopy.eyebrow}
                    </p>
                    <h2 className="mt-3 font-fustat text-[42px] font-extrabold leading-none text-white">
                      {isSignUp ? "Start with your email." : "Welcome back."}
                    </h2>
                    <p className="mt-3 font-inter text-sm leading-6 text-[#9ca3af]">
                      {isSignUp
                        ? "Create the account, verify the code, then set the password with the live matching prompt."
                        : "Use Google instantly or request a one-time code for your email."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={signInWithGoogle}
                      className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[#0ea5e9] via-[#006cff] to-[#1d4ed8] px-5 py-3.5 font-inter text-sm font-bold text-white shadow-[0_18px_48px_rgba(0,108,255,0.34)] transition hover:shadow-[0_22px_70px_rgba(56,189,248,0.32)]"
                    >
                      <GoogleIcon />
                      Continue with Google
                      <span className="absolute inset-y-0 left-[-25%] w-[20%] skew-x-[-18deg] bg-white/28 blur-sm transition-transform duration-700 group-hover:translate-x-[620%]" />
                    </button>
                    <div className="flex items-center gap-3 py-3">
                      <span className="h-px flex-1 bg-white/10" />
                      <span className="font-inter text-xs text-white/28">or</span>
                      <span className="h-px flex-1 bg-white/10" />
                    </div>
                    <button
                      onClick={() => setStep("email")}
                      className="flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3.5 font-inter text-sm font-bold text-white transition hover:border-[#38bdf8]/35 hover:bg-[#38bdf8]/10"
                    >
                      <Mail size={17} />
                      Continue with Email
                    </button>
                  </div>

                  {error && <p className="mt-4 font-inter text-sm text-[#f87171]">{error}</p>}
                  <p className="mt-8 text-center font-inter text-xs leading-5 text-white/30">
                    Secure OTP access for PrepPeer rank history and dashboard data.
                  </p>
                </motion.div>
              )}

              {step === "email" && (
                <motion.div key="email" {...panelMotion}>
                  <button
                    onClick={() => setStep("choice")}
                    className="mb-6 flex items-center gap-2 font-inter text-sm font-semibold text-white/48 transition hover:text-white"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  <p className="font-inter text-xs font-bold uppercase tracking-[0.22em] text-[#38bdf8]">
                    {activeCopy.eyebrow}
                  </p>
                  <h2 className="mt-3 font-fustat text-[40px] font-extrabold leading-none">
                    {activeCopy.title}
                  </h2>
                  <p className="mt-3 font-inter text-sm leading-6 text-[#9ca3af]">
                    {activeCopy.body}
                  </p>
                  <form
                    className="mt-8 space-y-4"
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
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[#006cff] px-5 py-3.5 font-inter text-sm font-bold text-white shadow-[0_18px_45px_rgba(0,108,255,0.28)] transition hover:bg-[#0b7cff] disabled:opacity-50"
                    >
                      {loading ? "Sending..." : activeCopy.action}
                      <ArrowRight size={17} />
                    </button>
                  </form>
                  {error && <p className="mt-4 font-inter text-sm text-[#f87171]">{error}</p>}
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
                    className="mb-6 flex items-center gap-2 font-inter text-sm font-semibold text-white/48 transition hover:text-white"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  <p className="font-inter text-xs font-bold uppercase tracking-[0.22em] text-[#38bdf8]">
                    Verification code
                  </p>
                  <h2 className="mt-3 font-fustat text-[40px] font-extrabold leading-none">
                    Check your inbox.
                  </h2>
                  <p className="mt-3 font-inter text-sm leading-6 text-[#9ca3af]">
                    Enter the 6 digit code sent to {email}.
                  </p>
                  <div className="mt-8 rounded-[26px] border border-white/10 bg-black/25 p-5">
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
                  <div className="mt-6 flex items-center justify-between gap-3">
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
                  {error && <p className="mt-4 font-inter text-sm text-[#f87171]">{error}</p>}
                </motion.div>
              )}

              {step === "password" && (
                <motion.div key="password" {...panelMotion}>
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#38bdf8]/20 bg-[#38bdf8]/10 text-[#7dd3fc]">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="font-inter text-xs font-bold uppercase tracking-[0.2em] text-[#38bdf8]">
                        Final account lock
                      </p>
                      <h2 className="font-fustat text-3xl font-extrabold">Create password</h2>
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
                  className="text-center"
                >
                  <motion.div
                    className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#38bdf8]/30 bg-[#38bdf8]/10 text-[#7dd3fc] shadow-[0_0_70px_rgba(56,189,248,0.32)]"
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 15 }}
                  >
                    <Check size={38} strokeWidth={2.8} />
                  </motion.div>
                  <div className="mt-6 flex items-center justify-center gap-2 font-inter text-xs font-bold uppercase tracking-[0.2em] text-[#38bdf8]">
                    <Sparkles size={14} />
                    Account ready
                  </div>
                  <h2 className="mt-3 font-fustat text-[42px] font-extrabold">You&apos;re in.</h2>
                  <p className="mt-3 font-inter text-sm leading-6 text-[#9ca3af]">
                    Your PrepPeer dashboard is ready to collect sessions, scores, and rank movement.
                  </p>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="mt-8 w-full rounded-full bg-[#006cff] px-5 py-3.5 font-inter text-sm font-bold text-white shadow-[0_18px_45px_rgba(0,108,255,0.28)] transition hover:bg-[#0b7cff]"
                  >
                    Continue to Dashboard
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
