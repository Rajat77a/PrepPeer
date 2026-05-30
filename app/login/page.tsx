"use client";

import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { OrbLogo } from "@/components/ui/OrbLogo";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { AssistedPasswordConfirmation } from "@/components/ui/assisted-password-confirmation";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup";
type AuthStep = "email" | "otp" | "password" | "success";

const panelMotion = {
  initial: { opacity: 0, x: 80 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -80 },
  transition: { duration: 0.4, ease: "easeOut" },
} as const;

const copy = {
  signin: {
    title: "Know where you stand",
    subtitle: "Run the interview. Read the rank. Improve the next answer.",
    emailButton: "Send sign-in code",
  },
  signup: {
    title: "Start with your rank",
    subtitle: "Create a profile for scores, progress, and every new jump.",
    emailButton: "Send sign-up code",
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

function MatrixBackground() {
  const activeCells = [
    { left: "7%", top: "31%", delay: "-0.2s" },
    { left: "12%", top: "67%", delay: "-1.4s" },
    { left: "19%", top: "18%", delay: "-2.1s" },
    { left: "28%", top: "56%", delay: "-0.8s" },
    { left: "34%", top: "38%", delay: "-1.9s" },
    { left: "42%", top: "74%", delay: "-0.5s" },
    { left: "49%", top: "24%", delay: "-2.5s" },
    { left: "57%", top: "61%", delay: "-1.1s" },
    { left: "64%", top: "42%", delay: "-2.8s" },
    { left: "72%", top: "20%", delay: "-0.9s" },
    { left: "78%", top: "69%", delay: "-2.2s" },
    { left: "86%", top: "35%", delay: "-1.6s" },
    { left: "93%", top: "58%", delay: "-0.4s" },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,108,255,0.14),transparent_32%),linear-gradient(to_bottom,rgba(0,0,0,0.08),rgba(0,0,0,0.88))]" />
      <div className="matrix-grid absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="matrix-grid matrix-grid-offset absolute inset-0 opacity-35" aria-hidden="true" />
      <div className="absolute inset-0" aria-hidden="true">
        {activeCells.map((cell, index) => (
          <span
            key={index}
            className="matrix-cell absolute h-[5px] w-[5px] rounded-[1px] bg-[#4db7ff]"
            style={{
              animationDelay: cell.delay,
              left: cell.left,
              top: cell.top,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black to-transparent" />
      <style jsx>{`
        .matrix-grid {
          background-image: conic-gradient(
            from 90deg at 4px 4px,
            rgba(0, 108, 255, 0.28) 0 90deg,
            transparent 0
          );
          background-size: 24px 24px;
          mask-image: radial-gradient(circle at center, black 0 58%, transparent 78%);
          animation: matrixGridPulse 4.6s ease-in-out infinite;
        }

        .matrix-grid-offset {
          background-position: 12px 12px;
          animation-delay: -2.3s;
        }

        .matrix-cell {
          box-shadow: 0 0 18px rgba(56, 189, 248, 0.65);
          animation: matrixBlink 2.8s ease-in-out infinite;
        }

        @keyframes matrixGridPulse {
          0%,
          100% {
            opacity: 0.36;
          }
          50% {
            opacity: 0.72;
          }
        }

        @keyframes matrixBlink {
          0%,
          100% {
            opacity: 0.08;
            transform: scale(0.82);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

      `}</style>
    </div>
  );
}

function TopNav({
  mode,
  onModeChange,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}) {
  return (
    <header className="fixed left-1/2 top-7 z-30 w-[calc(100%-2rem)] max-w-[330px] -translate-x-1/2 rounded-full border border-white/10 bg-[#111]/70 px-3 py-2.5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl">
      <div className="flex items-center justify-center gap-3">
        <Link
          href="/"
          className="flex shrink-0 items-center justify-center rounded-full transition hover:opacity-80"
          aria-label="Home"
        >
          <OrbLogo size={38} />
        </Link>

        <div className="flex shrink-0 items-center gap-2 rounded-full bg-white/[0.04] p-1">
          <button
            onClick={() => onModeChange("signin")}
            className={cn(
              "rounded-full px-4 py-2 font-inter text-sm font-semibold transition",
              mode === "signin"
                ? "bg-[#006cff] text-white shadow-[0_10px_30px_rgba(0,108,255,0.34)]"
                : "text-white/45 hover:text-white"
            )}
          >
            Sign in
          </button>
          <button
            onClick={() => onModeChange("signup")}
            className={cn(
              "rounded-full px-4 py-2 font-inter text-sm font-semibold transition",
              mode === "signup"
                ? "bg-white text-black shadow-[0_0_36px_rgba(255,255,255,0.28)]"
                : "text-white/45 hover:text-white"
            )}
          >
            Sign up
          </button>
        </div>
      </div>
    </header>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSignUp = mode === "signup";
  const activeCopy = copy[mode];

  const resetForMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setStep("email");
    setOtp("");
    setError("");
  };

  const friendlyAuthError = (message: string) => {
    if (message.toLowerCase().includes("signups not allowed")) {
      return "Email sign-up is not enabled yet.";
    }
    return message;
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
    if (signInError) setError(friendlyAuthError(signInError.message));
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
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: "email",
    });
    setLoading(false);

    if (verifyError) {
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
      <MatrixBackground />

      <TopNav mode={mode} onModeChange={resetForMode} />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-5 pb-12 pt-32">
        <div className="w-full max-w-[620px] text-center">
          <AnimatePresence mode="wait">
            {step === "email" && (
              <motion.div key={`email-${mode}`} {...panelMotion}>
                <h1 className="font-inter text-[clamp(48px,7vw,82px)] font-black leading-[0.92] tracking-[-0.06em] text-[#f7fbff] drop-shadow-[0_14px_42px_rgba(0,108,255,0.42)]">
                  {activeCopy.title}
                </h1>
                <p className="mx-auto mt-5 max-w-[620px] font-inter text-[clamp(20px,3vw,31px)] font-medium leading-tight tracking-[-0.035em] text-[#c8def4]">
                  {activeCopy.subtitle}
                </p>

                <div className="mx-auto mt-10 max-w-[460px] space-y-5">
                  <button
                    onClick={signInWithGoogle}
                    className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full border border-white/10 bg-white/[0.055] px-5 py-4 font-inter text-base font-medium text-white shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl transition hover:border-[#38bdf8]/30 hover:bg-white/[0.08]"
                  >
                    <GoogleIcon />
                    Sign in with Google
                    <span className="absolute inset-y-0 left-[-25%] w-[18%] skew-x-[-18deg] bg-[#38bdf8]/22 blur-sm transition-transform duration-700 group-hover:translate-x-[720%]" />
                  </button>

                  <div className="flex items-center gap-4">
                    <span className="h-px flex-1 bg-white/10" />
                    <span className="font-inter text-sm font-semibold text-white/34">or</span>
                    <span className="h-px flex-1 bg-white/10" />
                  </div>

                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      void sendOtp();
                    }}
                  >
                    <div className="relative">
                      <Input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        className="h-14 rounded-full px-16 text-center text-base placeholder:text-center"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        aria-label={activeCopy.emailButton}
                        className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-white/10 text-white transition hover:bg-[#006cff] disabled:opacity-50"
                      >
                        <ArrowRight size={17} />
                      </button>
                    </div>
                  </form>
                </div>

                {error && <p className="mt-5 font-inter text-sm text-[#f87171]">{error}</p>}
                <p className="mx-auto mt-16 max-w-[420px] font-inter text-xs leading-5 text-white/34">
                  By continuing, you agree to PrepPeer&apos;s terms and privacy policy.
                </p>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div key="otp" {...panelMotion}>
                <button
                  onClick={() => {
                    setOtp("");
                    setStep("email");
                  }}
                  className="mx-auto mb-8 flex items-center gap-2 font-inter text-sm font-semibold text-white/48 transition hover:text-white"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <h1 className="font-fustat text-[clamp(46px,7vw,74px)] font-extrabold leading-none tracking-[-0.03em]">
                  Enter your code
                </h1>
                <p className="mx-auto mt-4 max-w-[460px] font-inter text-xl font-light leading-8 text-white/52">
                  We sent it to {email}.
                </p>

                <div className="mx-auto mt-10 max-w-[460px] rounded-full border border-white/10 bg-white/[0.035] px-5 py-4 backdrop-blur-xl">
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

                <button
                  onClick={sendOtp}
                  disabled={loading}
                  className="mt-6 font-inter text-sm font-semibold text-[#7dd3fc] transition hover:text-white disabled:opacity-50"
                >
                  Resend code
                </button>
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
                      Password
                    </p>
                    <h1 className="font-fustat text-3xl font-extrabold">Create your password</h1>
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
              <motion.div key="success" {...panelMotion}>
                <motion.div
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#38bdf8]/30 bg-[#38bdf8]/10 text-[#7dd3fc]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 18 }}
                >
                  <Check size={34} strokeWidth={2.8} />
                </motion.div>
                <h1 className="mt-7 font-fustat text-[clamp(46px,7vw,74px)] font-extrabold leading-none tracking-[-0.03em]">
                  You&apos;re in
                </h1>
                <p className="mx-auto mt-4 max-w-[460px] font-inter text-xl font-light leading-8 text-white/52">
                  Continue to your dashboard.
                </p>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="mt-10 w-full max-w-[460px] rounded-full bg-white px-5 py-4 font-inter text-base font-semibold text-black transition hover:bg-white/90"
                >
                  Continue
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
