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

function LoginOrb({ className }: { className?: string }) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [canPlayOrbVideo, setCanPlayOrbVideo] = useState(false);

  useEffect(() => {
    const isIOSLike =
      /iPad|iPhone|iPod/.test(window.navigator.userAgent) ||
      (window.navigator.platform === "MacIntel" &&
        window.navigator.maxTouchPoints > 1);

    setCanPlayOrbVideo(!isIOSLike);
  }, []);

  return (
    <div className={cn("login-orb absolute", className)} aria-hidden="true">
      <div className="orb-fallback absolute inset-[5%] z-[1]" />
      {canPlayOrbVideo && !videoFailed && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="orb-video absolute inset-0 z-[2] h-full w-full object-cover"
          onError={() => setVideoFailed(true)}
        >
          <source
            src="https://future.co/images/homepage/glassy-orb/orb-purple.webm"
            type="video/webm"
          />
        </video>
      )}
    </div>
  );
}

function MatrixBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#f7fbff]" />
      <div className="login-ambient absolute inset-0" aria-hidden="true" />
      <LoginOrb className="login-orb-one" />
      <LoginOrb className="login-orb-two" />
      <LoginOrb className="login-orb-three" />
      <div className="login-waves absolute inset-0" aria-hidden="true" />
      <div className="login-vignette absolute inset-0" aria-hidden="true" />
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-white to-transparent" />
      <style jsx>{`
        .login-ambient {
          background:
            radial-gradient(circle at 50% 36%, rgba(255, 255, 255, 0.94) 0 18%, rgba(255, 255, 255, 0.5) 36%, transparent 62%),
            radial-gradient(circle at 18% 20%, rgba(0, 132, 255, 0.22), transparent 34%),
            radial-gradient(circle at 82% 72%, rgba(45, 212, 191, 0.16), transparent 36%),
            linear-gradient(180deg, #ffffff 0%, #eef7ff 48%, #ffffff 100%);
        }

        .login-orb {
          filter: drop-shadow(0 24px 60px rgba(0, 132, 255, 0.2));
          pointer-events: none;
          animation: loginOrbFloat 8s ease-in-out infinite;
        }

        .login-orb-one {
          height: 220px;
          right: 8%;
          top: 16%;
          width: 220px;
        }

        .login-orb-two {
          animation-delay: -3s;
          height: 126px;
          left: 10%;
          opacity: 0.5;
          top: 64%;
          width: 126px;
        }

        .login-orb-three {
          animation-delay: -5.2s;
          height: 82px;
          opacity: 0.34;
          right: 21%;
          top: 73%;
          width: 82px;
        }

        .login-waves {
          background:
            radial-gradient(ellipse at 22% 78%, rgba(0, 132, 255, 0.12) 0%, transparent 34%),
            radial-gradient(ellipse at 78% 24%, rgba(125, 255, 217, 0.1) 0%, transparent 31%),
            linear-gradient(135deg, transparent 0 42%, rgba(0, 132, 255, 0.045) 47%, transparent 54%),
            linear-gradient(35deg, transparent 0 38%, rgba(96, 177, 255, 0.05) 48%, transparent 59%);
          opacity: 0.9;
        }

        .login-vignette {
          background:
            radial-gradient(ellipse at center, rgba(255, 255, 255, 0.74) 0%, rgba(255, 255, 255, 0.46) 34%, transparent 67%),
            linear-gradient(90deg, rgba(255, 255, 255, 0.7), transparent 24%, transparent 76%, rgba(255, 255, 255, 0.7));
        }

        @keyframes loginOrbFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(-4deg) scale(1);
          }
          50% {
            transform: translate3d(0, -18px, 0) rotate(5deg) scale(1.035);
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
    <header className="fixed left-1/2 top-7 z-30 w-[calc(100%-2rem)] max-w-[330px] -translate-x-1/2 rounded-full border border-white/70 bg-white/70 px-3 py-2.5 shadow-[0_22px_70px_rgba(0,132,255,0.14),inset_0_1px_2px_rgba(255,255,255,0.9)] backdrop-blur-xl">
      <div className="flex items-center justify-center gap-3">
        <Link
          href="/"
          className="flex shrink-0 items-center justify-center rounded-full transition hover:opacity-80"
          aria-label="Home"
        >
          <OrbLogo size={38} />
        </Link>

        <div className="flex shrink-0 items-center gap-2 rounded-full bg-[#eef7ff]/80 p-1 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9)]">
          <button
            onClick={() => onModeChange("signin")}
            className={cn(
              "rounded-full px-4 py-2 font-inter text-sm font-semibold transition",
              mode === "signin"
                ? "bg-[#006cff] text-white shadow-[0_10px_30px_rgba(0,108,255,0.34)]"
                : "text-[#64748b] hover:text-[#0f172a]"
            )}
          >
            Sign in
          </button>
          <button
            onClick={() => onModeChange("signup")}
            className={cn(
              "rounded-full px-4 py-2 font-inter text-sm font-semibold transition",
              mode === "signup"
                ? "bg-white text-[#0f172a] shadow-[0_14px_32px_rgba(15,23,42,0.12)]"
                : "text-[#64748b] hover:text-[#0f172a]"
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

  const getAuthRedirectUrl = (nextPath: string) => {
    const next = nextPath.startsWith("/") ? nextPath : "/dashboard";
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  };

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
        redirectTo: getAuthRedirectUrl("/dashboard"),
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
        emailRedirectTo: getAuthRedirectUrl(
          isSignUp ? "/login?auth=create-password" : "/dashboard"
        ),
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("error");

    if (authError) {
      setError(
        authError === "auth_not_configured"
          ? "Authentication is not configured yet."
          : "We could not complete authentication. Please try again."
      );
      window.history.replaceState(null, "", "/login");
      return;
    }

    if (params.get("auth") !== "create-password") return;

    const syncVerifiedSignup = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setMode("signup");
          setStep("email");
          setError("Your verification link expired. Please request a new code.");
          return;
        }

        setMode("signup");
        setEmail(user.email ?? "");
        setOtp("");
        setError("");
        setStep("password");
        window.history.replaceState(null, "", "/login");
      } catch {
        setError("We could not finish email verification. Please try again.");
      }
    };

    void syncVerifiedSignup();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-[#07111f]">
      <MatrixBackground />

      <TopNav mode={mode} onModeChange={resetForMode} />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-5 pb-12 pt-32">
        <div className="w-full max-w-[620px] text-center">
          <AnimatePresence mode="wait">
            {step === "email" && (
              <motion.div key={`email-${mode}`} {...panelMotion}>
                <h1 className="font-inter text-[clamp(48px,7vw,82px)] font-black leading-[0.92] tracking-[-0.06em] text-[#07111f] drop-shadow-[0_18px_36px_rgba(0,132,255,0.16)]">
                  {activeCopy.title}
                </h1>
                <p className="mx-auto mt-5 max-w-[620px] font-inter text-[clamp(20px,3vw,31px)] font-medium leading-tight tracking-[-0.035em] text-[#5f6f84]">
                  {activeCopy.subtitle}
                </p>

                <div className="mx-auto mt-10 max-w-[460px] space-y-5">
                  <button
                    onClick={signInWithGoogle}
                    className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full border border-white/80 bg-white/75 px-5 py-4 font-inter text-base font-bold text-[#07111f] shadow-[0_22px_70px_rgba(0,132,255,0.16),inset_0_1px_2px_rgba(255,255,255,0.95)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[#0084ff]/30 hover:bg-white"
                  >
                    <GoogleIcon />
                    Sign in with Google
                    <span className="absolute inset-y-0 left-[-25%] w-[18%] skew-x-[-18deg] bg-[#38bdf8]/28 blur-sm transition-transform duration-700 group-hover:translate-x-[720%]" />
                  </button>

                  <div className="flex items-center gap-4">
                    <span className="h-px flex-1 bg-[#cfe7ff]" />
                    <span className="font-inter text-sm font-semibold text-[#7b8da3]">or</span>
                    <span className="h-px flex-1 bg-[#cfe7ff]" />
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
                        className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-[#0084ff] text-white shadow-[0_12px_28px_rgba(0,132,255,0.3)] transition hover:scale-105 hover:bg-[#006cff] disabled:opacity-50"
                      >
                        <ArrowRight size={17} />
                      </button>
                    </div>
                  </form>
                </div>

                {error && <p className="mt-5 font-inter text-sm text-[#dc2626]">{error}</p>}
                <p className="mx-auto mt-16 max-w-[420px] font-inter text-xs leading-5 text-[#7b8da3]">
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
                  className="mx-auto mb-8 flex items-center gap-2 font-inter text-sm font-semibold text-[#64748b] transition hover:text-[#0084ff]"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <h1 className="font-fustat text-[clamp(46px,7vw,74px)] font-extrabold leading-none tracking-[-0.03em]">
                  Enter your code
                </h1>
                <p className="mx-auto mt-4 max-w-[460px] font-inter text-xl font-medium leading-8 text-[#64748b]">
                  We sent it to {email}.
                </p>

                <div className="mx-auto mt-10 max-w-[460px] rounded-[30px] border border-[#1d3c75]/18 bg-[#0b1b3f]/92 px-5 py-4 shadow-[0_24px_72px_rgba(6,16,89,0.22),inset_0_1px_2px_rgba(255,255,255,0.14)] backdrop-blur-xl">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={loading}>
                    <InputOTPGroup>
                      <InputOTPSlot
                        index={0}
                        className="border-white/10 bg-white/[0.08] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.16)]"
                      />
                      <InputOTPSlot
                        index={1}
                        className="border-white/10 bg-white/[0.08] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.16)]"
                      />
                      <InputOTPSlot
                        index={2}
                        className="border-white/10 bg-white/[0.08] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.16)]"
                      />
                    </InputOTPGroup>
                    <InputOTPSeparator className="text-white/35" />
                    <InputOTPGroup>
                      <InputOTPSlot
                        index={3}
                        className="border-white/10 bg-white/[0.08] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.16)]"
                      />
                      <InputOTPSlot
                        index={4}
                        className="border-white/10 bg-white/[0.08] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.16)]"
                      />
                      <InputOTPSlot
                        index={5}
                        className="border-white/10 bg-white/[0.08] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.16)]"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <button
                  onClick={sendOtp}
                  disabled={loading}
                  className="mt-6 font-inter text-sm font-semibold text-[#0084ff] transition hover:text-[#005bd3] disabled:opacity-50"
                >
                  Resend code
                </button>
                {error && <p className="mt-5 font-inter text-sm text-[#dc2626]">{error}</p>}
              </motion.div>
            )}

            {step === "password" && (
              <motion.div key="password" {...panelMotion} className="mx-auto max-w-[500px] text-left">
                <button
                  onClick={() => setStep("otp")}
                  className="mb-6 flex items-center gap-2 font-inter text-sm font-semibold text-[#64748b] transition hover:text-[#0084ff]"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#0084ff]/20 bg-[#e7f4ff] text-[#0084ff] shadow-[0_12px_28px_rgba(0,132,255,0.12)]">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="font-inter text-xs font-bold uppercase tracking-[0.2em] text-[#0084ff]">
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
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#0084ff]/20 bg-white/75 text-[#0084ff] shadow-[0_22px_70px_rgba(0,132,255,0.2),inset_0_1px_2px_rgba(255,255,255,0.95)]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 18 }}
                >
                  <Check size={34} strokeWidth={2.8} />
                </motion.div>
                <h1 className="mt-7 font-fustat text-[clamp(46px,7vw,74px)] font-extrabold leading-none tracking-[-0.03em]">
                  You&apos;re in
                </h1>
                <p className="mx-auto mt-4 max-w-[460px] font-inter text-xl font-medium leading-8 text-[#64748b]">
                  Continue to your dashboard.
                </p>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="mt-10 w-full max-w-[460px] rounded-full bg-[#0084ff] px-5 py-4 font-inter text-base font-semibold text-white shadow-[0_18px_48px_rgba(0,132,255,0.28)] transition hover:-translate-y-0.5 hover:bg-[#006cff]"
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
