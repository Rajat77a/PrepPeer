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
  initial: { opacity: 0, y: 18, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -18, filter: "blur(8px)" },
  transition: { duration: 0.36, ease: "easeOut" },
} as const;

const copy = {
  signin: {
    title: "Know where you stand",
    subtitle: "Run the interview. Read the rank. Improve the next answer.",
    emailButton: "Send sign-in code",
    helper: "New to PrepPeer?",
    helperAction: "Create account",
  },
  signup: {
    title: "Start with your rank",
    subtitle: "Create a profile for scores, progress, and every new jump.",
    emailButton: "Send sign-up code",
    helper: "Already have an account?",
    helperAction: "Log in",
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

function LoginBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#f7fbff]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,0.98)_0%,rgba(234,245,255,0.92)_38%,rgba(215,236,255,0.72)_72%,#ffffff_100%)]" />

      <div
        className="absolute -right-48 -top-56 h-[680px] w-[820px] rotate-[28deg] rounded-[46%] bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(234,245,255,0.72),rgba(207,231,255,0.44))] opacity-95 blur-[8px]"
        aria-hidden="true"
      />

      <div
        className="absolute -left-52 bottom-[-20rem] h-[720px] w-[860px] rotate-[34deg] rounded-[44%] bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(234,245,255,0.72),rgba(255,255,255,0.40))] opacity-95 blur-[10px]"
        aria-hidden="true"
      />

      <div className="absolute left-[10%] top-[18%] h-72 w-72 rounded-full bg-[#0084ff]/10 blur-[80px]" />
      <div className="absolute right-[14%] bottom-[18%] h-80 w-80 rounded-full bg-[#7dffd9]/12 blur-[90px]" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,132,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,132,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px] opacity-65" />

      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}

function AuthModeSwitch({
  mode,
  onModeChange,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}) {
  return (
    <div className="mx-auto flex w-fit items-center gap-1 rounded-full border border-white/80 bg-white/72 p-1 shadow-[0_18px_56px_rgba(0,108,255,0.14),inset_0_1px_2px_rgba(255,255,255,0.96)] backdrop-blur-xl">
      <button
        type="button"
        onClick={() => onModeChange("signin")}
        className={cn(
          "rounded-full px-5 py-2.5 font-inter text-sm font-black transition",
          mode === "signin"
            ? "bg-[#eaf5ff] text-[#07111f] shadow-[0_10px_28px_rgba(0,108,255,0.10)]"
            : "text-[#64748b] hover:text-[#07111f]"
        )}
      >
        Sign in
      </button>
      <button
        type="button"
        onClick={() => onModeChange("signup")}
        className={cn(
          "rounded-full px-5 py-2.5 font-inter text-sm font-black transition",
          mode === "signup"
            ? "bg-white text-[#07111f] shadow-[0_10px_28px_rgba(15,23,42,0.10)]"
            : "text-[#64748b] hover:text-[#07111f]"
        )}
      >
        Sign up
      </button>
    </div>
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
  const [signupNonce, setSignupNonce] = useState("");

  const isSignUp = mode === "signup";
  const activeCopy = copy[mode];

  const otpSlotClass =
    "!h-14 !w-12 rounded-xl !border-[#cfe7ff] !bg-white/88 text-xl !text-[#07111f] shadow-[0_16px_34px_rgba(0,108,255,0.10),inset_0_1px_1px_rgba(255,255,255,0.96)] transition-all duration-300 data-[filled=true]:!border-[#60b1ff] data-[filled=true]:!bg-[#f7fbff] data-[active=true]:!border-[#0084ff] data-[active=true]:!shadow-[0_0_0_3px_rgba(0,132,255,0.18),0_0_24px_rgba(0,132,255,0.18)]";

  const getAuthRedirectUrl = (nextPath: string) => {
    const next =
      nextPath.startsWith("/dashboard") && !nextPath.startsWith("//")
        ? nextPath
        : "/dashboard";

    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      next
    )}&mode=${mode}`;
  };

  const getPostAuthPath = () => {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");

    return next?.startsWith("/dashboard") && !next.startsWith("//")
      ? next
      : "/dashboard";
  };

  const resetForMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setStep("email");
    setOtp("");
    setSignupNonce("");
    setError("");
  };

  const friendlyAuthError = (message: string) => {
    const normalized = message.toLowerCase();

    if (normalized.includes("signups not allowed")) {
      return isSignUp
        ? "Email sign-up is not enabled yet. Please continue with Google."
        : "No PrepPeer account was found for this email. Create an account first.";
    }

    if (
      normalized.includes("error sending confirmation email") ||
      normalized.includes("email rate limit") ||
      normalized.includes("smtp")
    ) {
      return "Email sign-up is temporarily unavailable. Please continue with Google.";
    }

    return message;
  };

  const isFreshSignupUser = (createdAt?: string) => {
    if (!createdAt) return false;

    const createdTime = new Date(createdAt).getTime();
    if (Number.isNaN(createdTime)) return false;

    return Date.now() - createdTime < 12 * 60 * 1000;
  };

  const signInWithGoogle = async () => {
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthRedirectUrl(getPostAuthPath()),
      },
    });

    if (signInError) setError(friendlyAuthError(signInError.message));
  };

  const sendOtp = async () => {
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    const supabase = createClient();
    const nextSignupNonce =
      isSignUp && typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : isSignUp
          ? `${Date.now()}-${Math.random().toString(36).slice(2)}`
          : "";

    setSignupNonce(nextSignupNonce);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: isSignUp,
        data: isSignUp
          ? {
              preppeer_signup_nonce: nextSignupNonce,
            }
          : undefined,
      },
    });

    setLoading(false);

    if (otpError) {
      setSignupNonce("");
      setError(friendlyAuthError(otpError.message));
      return;
    }

    setStep("otp");
  };

  const verifyOtp = async (code: string) => {
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: verifyData, error: verifyError } =
      await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: "email",
      });

    setLoading(false);

    if (verifyError) {
      setError("Invalid code. Please try again.");
      return;
    }

    const nextPath = getPostAuthPath();

    if (isSignUp) {
      const hasCurrentSignupMarker =
        verifyData.user?.user_metadata?.preppeer_signup_nonce === signupNonce;

      if (
        !hasCurrentSignupMarker ||
        !isFreshSignupUser(verifyData.user?.created_at)
      ) {
        await supabase.auth.signOut();
        setMode("signin");
        setStep("email");
        setOtp("");
        setSignupNonce("");
        setError(
          "This email already has a PrepPeer account. Sign in instead to continue."
        );
        return;
      }

      sessionStorage.setItem("preppeer_post_onboarding_next", nextPath);
      router.push(`/onboarding?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    router.push(nextPath);
  };

  const savePassword = async (password: string) => {
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: passwordError } = await supabase.auth.updateUser({
      password,
    });

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
    const requestedMode = params.get("mode");

    if (requestedMode === "signup" || requestedMode === "signin") {
      setMode(requestedMode);
    }

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
    <main className="relative min-h-screen overflow-hidden bg-[#f7fbff] text-[#07111f]">
      <LoginBackground />

      <Link
        href="/"
        className="fixed left-6 top-6 z-30 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 font-inter text-sm font-bold text-[#64748b] shadow-[0_16px_50px_rgba(0,108,255,0.10)] backdrop-blur-xl transition hover:text-[#006cff]"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </Link>

      <section className="relative z-10 flex min-h-screen items-center justify-center px-5 py-20">
        <div className="w-full max-w-[620px]">
          <AnimatePresence mode="wait">
            {step === "email" && (
              <motion.div
                key={`email-${mode}`}
                {...panelMotion}
                className="text-center"
              >
                <div className="mb-6 flex justify-center">
                  <div className="rounded-3xl border border-white/80 bg-white/72 p-3 shadow-[0_24px_70px_rgba(0,108,255,0.16),inset_0_1px_2px_rgba(255,255,255,0.96)] backdrop-blur-xl">
                    <OrbLogo size={58} />
                  </div>
                </div>

                <AuthModeSwitch mode={mode} onModeChange={resetForMode} />

                <h1 className="mt-8 font-inter text-[clamp(48px,8vw,84px)] font-black leading-[0.9] tracking-[-0.07em] text-[#07111f] drop-shadow-[0_18px_36px_rgba(0,132,255,0.14)]">
                  {activeCopy.title}
                </h1>

                <p className="mx-auto mt-5 max-w-[540px] font-inter text-xl font-semibold leading-8 tracking-[-0.035em] text-[#64748b]">
                  {activeCopy.subtitle}
                </p>

                <p className="mt-4 font-inter text-sm font-bold text-[#64748b]">
                  {activeCopy.helper}{" "}
                  <button
                    type="button"
                    onClick={() => resetForMode(isSignUp ? "signin" : "signup")}
                    className="text-[#006cff] transition hover:text-[#0057cc]"
                  >
                    {activeCopy.helperAction}
                  </button>
                </p>

                <div className="mx-auto mt-9 max-w-[520px]">
                  <button
                    onClick={signInWithGoogle}
                    className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/80 bg-white/76 px-5 font-inter text-base font-black text-[#07111f] shadow-[0_22px_70px_rgba(0,132,255,0.15),inset_0_1px_2px_rgba(255,255,255,0.98)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[#0084ff]/30 hover:bg-white"
                  >
                    <GoogleIcon />
                    Sign in with Google
                    <span className="absolute inset-y-0 left-[-25%] w-[18%] skew-x-[-18deg] bg-[#38bdf8]/28 blur-sm transition-transform duration-700 group-hover:translate-x-[720%]" />
                  </button>

                  <div className="my-7 flex items-center gap-4">
                    <span className="h-px flex-1 bg-[#cfe7ff]" />
                    <span className="font-inter text-sm font-black text-[#7b8da3]">
                      or
                    </span>
                    <span className="h-px flex-1 bg-[#cfe7ff]" />
                  </div>

                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      void sendOtp();
                    }}
                    className="space-y-4 text-left"
                  >
                    <label className="block">
                      <span className="mb-2 block font-inter text-xs font-black uppercase tracking-[0.16em] text-[#64748b]">
                        Email
                      </span>
                      <div className="relative">
                        <Input
                          type="email"
                          value={email}
                          onChange={(event) => {
                            setError("");
                            setEmail(event.target.value);
                          }}
                          placeholder="you@example.com"
                          autoComplete="email"
                          required
                          className="h-14 rounded-2xl border-[#cfe7ff] bg-white/82 px-5 pr-14 text-left font-inter text-base font-bold text-[#07111f] shadow-[0_18px_48px_rgba(0,108,255,0.10)] placeholder:text-[#9aa9bb] focus:border-[#0084ff]/70 focus:shadow-[0_0_0_4px_rgba(0,132,255,0.12)]"
                        />
                        <button
                          type="submit"
                          disabled={loading}
                          aria-label={activeCopy.emailButton}
                          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center overflow-hidden rounded-xl bg-[#0084ff] text-white shadow-[0_12px_28px_rgba(0,132,255,0.3)] transition hover:scale-105 hover:bg-[#006cff] disabled:opacity-50"
                        >
                          <ArrowRight size={17} />
                        </button>
                      </div>
                    </label>
                  </form>
                </div>

                {error && (
                  <p className="mt-5 text-center font-inter text-sm font-bold text-[#dc2626]">
                    {error}
                  </p>
                )}

                <p className="mx-auto mt-12 max-w-[460px] text-center font-inter text-xs font-semibold leading-5 text-[#7b8da3]">
                  By continuing, you agree to PrepPeer&apos;s terms and privacy
                  policy.
                </p>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div key="otp" {...panelMotion} className="text-center">
                <button
                  onClick={() => {
                    setOtp("");
                    setStep("email");
                  }}
                  className="mx-auto mb-8 flex items-center gap-2 font-inter text-sm font-bold text-[#64748b] transition hover:text-[#0084ff]"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <div className="mb-6 flex justify-center">
                  <div className="rounded-3xl border border-white/80 bg-white/72 p-3 shadow-[0_24px_70px_rgba(0,108,255,0.16),inset_0_1px_2px_rgba(255,255,255,0.96)] backdrop-blur-xl">
                    <OrbLogo size={58} />
                  </div>
                </div>

                <h1 className="font-inter text-[clamp(44px,7vw,76px)] font-black leading-[0.9] tracking-[-0.06em] text-[#07111f]">
                  Enter your code
                </h1>

                <p className="mx-auto mt-5 max-w-[460px] font-inter text-lg font-semibold leading-8 text-[#64748b]">
                  We sent a sign-in code to {email}.
                </p>

                <div className="mx-auto mt-10 max-w-[480px] rounded-[34px] border border-white/80 bg-white/66 p-3 shadow-[0_26px_88px_rgba(0,108,255,0.14),inset_0_1px_2px_rgba(255,255,255,0.95)] backdrop-blur-2xl">
                  <div className="rounded-[26px] border border-[#cfe7ff] bg-white/78 px-4 py-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.96),0_18px_42px_rgba(0,108,255,0.10)]">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => {
                        setError("");
                        setOtp(value);
                      }}
                      disabled={loading}
                      containerClassName="justify-center gap-2 sm:gap-3"
                    >
                      <InputOTPGroup className="gap-2 sm:gap-3">
                        {[0, 1, 2].map((index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className={otpSlotClass}
                          />
                        ))}
                      </InputOTPGroup>
                      <InputOTPSeparator className="px-0 text-[#6f7f96]/60" />
                      <InputOTPGroup className="gap-2 sm:gap-3">
                        {[3, 4, 5].map((index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className={otpSlotClass}
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                <button
                  onClick={sendOtp}
                  disabled={loading}
                  className="mt-6 font-inter text-sm font-bold text-[#0084ff] transition hover:text-[#005bd3] disabled:opacity-50"
                >
                  Resend code
                </button>

                {error && (
                  <p className="mt-5 font-inter text-sm font-bold text-[#dc2626]">
                    {error}
                  </p>
                )}
              </motion.div>
            )}

            {step === "password" && (
              <motion.div
                key="password"
                {...panelMotion}
                className="mx-auto max-w-[520px] rounded-[34px] border border-white/80 bg-white/72 p-7 text-left shadow-[0_30px_110px_rgba(0,108,255,0.16),inset_0_1px_2px_rgba(255,255,255,0.96)] backdrop-blur-2xl sm:p-9"
              >
                <button
                  onClick={() => setStep("otp")}
                  className="mb-6 flex items-center gap-2 font-inter text-sm font-bold text-[#64748b] transition hover:text-[#0084ff]"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#0084ff]/20 bg-[#e7f4ff] text-[#0084ff] shadow-[0_12px_28px_rgba(0,132,255,0.12)]">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="font-inter text-xs font-black uppercase tracking-[0.2em] text-[#0084ff]">
                      Password
                    </p>
                    <h1 className="font-inter text-3xl font-black tracking-[-0.04em] text-[#07111f]">
                      Create your password
                    </h1>
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
              <motion.div key="success" {...panelMotion} className="text-center">
                <motion.div
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#0084ff]/20 bg-white/75 text-[#0084ff] shadow-[0_22px_70px_rgba(0,132,255,0.2),inset_0_1px_2px_rgba(255,255,255,0.95)]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 18 }}
                >
                  <Check size={34} strokeWidth={2.8} />
                </motion.div>

                <h1 className="mt-7 font-inter text-[clamp(44px,7vw,76px)] font-black leading-[0.9] tracking-[-0.06em] text-[#07111f]">
                  You&apos;re in
                </h1>

                <p className="mx-auto mt-5 max-w-[460px] font-inter text-lg font-semibold leading-8 text-[#64748b]">
                  Continue to your dashboard.
                </p>

                <button
                  onClick={() => router.push("/dashboard")}
                  className="mt-10 h-14 w-full max-w-[460px] rounded-2xl bg-[#0084ff] px-5 font-inter text-base font-black text-white shadow-[0_18px_48px_rgba(0,132,255,0.28)] transition hover:-translate-y-0.5 hover:bg-[#006cff]"
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
