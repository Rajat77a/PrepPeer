"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Home,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { OrbLogo } from "@/components/ui/OrbLogo";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { AssistedPasswordConfirmation } from "@/components/ui/assisted-password-confirmation";

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
    title: "Welcome back",
    emailButton: "Send sign-in code",
    helper: "New to PrepPeer?",
    helperAction: "Create account",
  },
  signup: {
    title: "Create a PrepPeer account",
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
      <div className="absolute inset-0 bg-[#031b4f]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(0,132,255,0.34)_0%,rgba(3,27,79,0.96)_38%,#01143d_100%)]" />

      <div
        className="absolute -right-[260px] -top-[260px] h-[620px] w-[720px] rotate-[28deg] rounded-[46%] bg-[radial-gradient(ellipse_at_35%_35%,rgba(255,255,255,0.96)_0%,rgba(235,246,255,0.82)_28%,rgba(182,215,245,0.52)_52%,rgba(255,255,255,0.18)_72%,transparent_100%)] opacity-95 blur-[2px]"
        aria-hidden="true"
      />

      <div
        className="absolute -right-[220px] -top-[210px] h-[560px] w-[650px] rotate-[29deg] rounded-[46%] bg-[linear-gradient(135deg,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.42)_24%,rgba(147,188,230,0.28)_48%,rgba(255,255,255,0.10)_72%,transparent_100%)] opacity-80 blur-[18px]"
        aria-hidden="true"
      />

      <div
        className="absolute -left-[280px] bottom-[-350px] h-[720px] w-[850px] rotate-[38deg] rounded-[44%] bg-[radial-gradient(ellipse_at_60%_35%,rgba(255,255,255,0.98)_0%,rgba(230,244,255,0.82)_24%,rgba(172,211,244,0.46)_48%,rgba(255,255,255,0.16)_72%,transparent_100%)] opacity-95 blur-[3px]"
        aria-hidden="true"
      />

      <div
        className="absolute -left-[240px] bottom-[-300px] h-[650px] w-[760px] rotate-[39deg] rounded-[44%] bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.22)_34%,rgba(255,255,255,0.88)_56%,rgba(207,231,255,0.42)_74%,transparent_100%)] opacity-90 blur-[16px]"
        aria-hidden="true"
      />

      <div className="absolute left-[18%] top-[28%] h-[280px] w-[420px] rounded-full bg-[#0084ff]/18 blur-[110px]" />
      <div className="absolute right-[18%] bottom-[24%] h-[260px] w-[360px] rounded-full bg-[#7dffd9]/10 blur-[100px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,10,35,0.10)_52%,rgba(0,8,28,0.38)_100%)]" />

      <div
        className="absolute inset-0 opacity-[0.13] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
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
    "!h-14 !w-12 rounded-xl !border-white/25 !bg-white/14 text-xl !text-white shadow-[0_16px_34px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.18)] transition-all duration-300 data-[filled=true]:!border-white/55 data-[filled=true]:!bg-white/22 data-[active=true]:!border-white data-[active=true]:!shadow-[0_0_0_3px_rgba(255,255,255,0.18),0_0_24px_rgba(255,255,255,0.18)]";

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
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      const verifiedUser = user ?? verifyData.user;
      const metadata = verifiedUser?.user_metadata ?? {};
      const hasCompletedSetup =
        metadata.onboarding_complete === true &&
        Boolean(
          String(metadata.full_name ?? metadata.name ?? "").trim() &&
            String(metadata.college ?? "").trim() &&
            String(metadata.target_role ?? "").trim() &&
            String(metadata.experience_level ?? "").trim() &&
            String(metadata.target_company_type ?? "").trim()
        );

      if (userError || !verifiedUser) {
        setError("Account verified, but the session was not ready. Please sign in.");
        return;
      }

      if (hasCompletedSetup) {
        router.replace(nextPath);
        router.refresh();
        return;
      }

      sessionStorage.setItem("preppeer_post_onboarding_next", nextPath);
      router.replace(`/onboarding?next=${encodeURIComponent(nextPath)}`);
      router.refresh();
      return;
    }

    router.replace(nextPath);
    router.refresh();
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
    <main className="relative min-h-screen overflow-hidden bg-[#031b4f] text-white">
      <LoginBackground />

      <Link
        href="/"
        aria-label="Return to PrepPeer home"
        className="group absolute left-5 top-5 z-20 [perspective:700px] sm:left-8 sm:top-8"
      >
        <motion.div
          initial={{ opacity: 0, x: -16, rotateY: 18 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          whileHover={{
            y: -5,
            rotateX: 8,
            rotateY: -12,
            scale: 1.04,
          }}
          whileTap={{ y: 2, rotateX: 0, rotateY: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
          className="relative h-[54px] w-[54px] transform-gpu [transform-style:preserve-3d]"
        >
          <span className="absolute inset-x-[7px] bottom-[-7px] h-10 rounded-[15px] border border-[#2097ff]/25 bg-[#00102b]/90 shadow-[0_16px_34px_rgba(0,8,30,0.48)] transition-all duration-500 [transform:translateZ(-12px)] group-hover:bottom-[-4px] group-hover:rotate-[-5deg] group-hover:border-[#4cb4ff]/45" />

          <span className="absolute inset-[3px] rounded-[17px] border border-white/16 bg-[#06275c]/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-xl transition-all duration-500 [transform:translateZ(-2px)] group-hover:rotate-[6deg] group-hover:border-[#55bbff]/55 group-hover:bg-[#073575]/90" />

          <span className="absolute inset-0 flex items-center justify-center rounded-[18px] border border-white/38 bg-[linear-gradient(145deg,rgba(18,93,178,0.94),rgba(1,25,67,0.96))] text-white shadow-[0_12px_30px_rgba(0,22,67,0.36),inset_0_1px_0_rgba(255,255,255,0.38)] transition-all duration-500 [transform:translateZ(10px)] group-hover:-rotate-[3deg] group-hover:border-white/75 group-hover:bg-[linear-gradient(145deg,#168dff,#052860)] group-hover:shadow-[0_18px_42px_rgba(0,108,255,0.42),inset_0_1px_0_rgba(255,255,255,0.55)]">
            <span className="absolute left-[9px] top-[8px] h-[3px] w-[15px] rounded-full bg-white/38 transition-all duration-500 group-hover:w-[22px] group-hover:bg-white/70" />
            <Home
              aria-hidden="true"
              className="h-[21px] w-[21px] transition-all duration-500 [transform:translateZ(18px)] group-hover:-translate-y-0.5 group-hover:scale-110"
              strokeWidth={2.25}
            />
            <span className="absolute bottom-[7px] h-[2px] w-2 rounded-full bg-[#68d7ff] opacity-65 shadow-[0_0_10px_rgba(104,215,255,0.85)] transition-all duration-500 group-hover:w-5 group-hover:bg-white group-hover:opacity-100" />
          </span>
        </motion.div>
      </Link>

      <section className="relative z-10 flex min-h-svh items-center justify-center px-5 py-6 sm:py-8">
        <div className="w-full max-w-[500px]">
          <AnimatePresence mode="wait">
            {step === "email" && (
              <motion.div
                key={`email-${mode}`}
                {...panelMotion}
                className="text-center"
              >
                <div className="mb-8 flex items-center justify-center gap-3">
                  <OrbLogo size={36} />
                  <span className="font-inter text-lg font-black tracking-[-0.03em] text-white">
                    PrepPeer
                  </span>
                </div>

                <h1 className="font-inter text-[clamp(38px,6vw,56px)] font-black leading-[0.95] tracking-[-0.06em] text-white drop-shadow-[0_18px_36px_rgba(0,38,96,0.22)]">
                  {activeCopy.title}
                </h1>

                <p className="mt-4 font-inter text-sm font-semibold text-white/70">
                  {activeCopy.helper}{" "}
                  <button
                    type="button"
                    onClick={() => resetForMode(isSignUp ? "signin" : "signup")}
                    className="font-black text-white underline decoration-white/35 underline-offset-4 transition hover:text-[#d7ecff] hover:decoration-white"
                  >
                    {activeCopy.helperAction}
                  </button>
                </p>

                <div className="mx-auto mt-4 max-w-[460px]">
                  <button
                    onClick={signInWithGoogle}
                    className="group relative flex h-12 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/22 bg-white/14 px-5 font-inter text-base font-black text-white shadow-[0_22px_70px_rgba(0,38,96,0.18),inset_0_1px_2px_rgba(255,255,255,0.22)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[#06142b] hover:shadow-[0_22px_70px_rgba(255,255,255,0.26),inset_0_1px_2px_rgba(255,255,255,0.95)]"
                  >
                    <GoogleIcon />
                    Sign in with Google
                    <span className="absolute inset-y-0 left-[-25%] w-[18%] skew-x-[-18deg] bg-white/60 blur-sm transition-transform duration-700 group-hover:translate-x-[720%] group-hover:bg-[#eaf5ff]" />
                  </button>

                  <div className="my-5 flex items-center gap-4">
                    <span className="h-px flex-1 bg-white/24" />
                    <span className="font-inter text-sm font-black text-white/70">
                      or
                    </span>
                    <span className="h-px flex-1 bg-white/24" />
                  </div>

                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      void sendOtp();
                    }}
                    className="space-y-4 text-left"
                  >
                    <label className="block" aria-label="Email">
                      <div
                        className="group/email relative flex h-12 w-full items-center overflow-hidden rounded-2xl border border-white/22 bg-white/14 font-inter text-base font-black text-white shadow-[0_22px_70px_rgba(0,38,96,0.18),inset_0_1px_2px_rgba(255,255,255,0.22)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[#06142b] hover:shadow-[0_22px_70px_rgba(255,255,255,0.26),inset_0_1px_2px_rgba(255,255,255,0.95)] focus-within:-translate-y-0.5 focus-within:border-white focus-within:bg-white focus-within:text-[#06142b] focus-within:shadow-[0_22px_70px_rgba(255,255,255,0.26),inset_0_1px_2px_rgba(255,255,255,0.95)]"
                      >
                        <input
                          type="email"
                          value={email}
                          onChange={(event) => {
                            setError("");
                            setEmail(event.target.value);
                          }}
                          placeholder="you@example.com"
                          autoComplete="email"
                          required
                          className="relative z-10 h-full min-w-0 flex-1 border-0 bg-transparent px-5 pr-14 text-left font-inter text-base font-black text-white outline-none transition duration-300 placeholder:text-white/62 group-hover/email:text-[#06142b] group-hover/email:placeholder:text-[#5f7188] group-focus-within/email:text-[#06142b] group-focus-within/email:placeholder:text-[#5f7188]"
                        />
                        <button
                          type="submit"
                          disabled={loading}
                          aria-label={activeCopy.emailButton}
                          className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center overflow-hidden rounded-xl bg-white/18 text-white shadow-[0_12px_28px_rgba(0,38,96,0.16)] transition duration-300 hover:scale-105 group-hover/email:bg-[#eef7ff] group-hover/email:text-[#006cff] group-focus-within/email:bg-[#eef7ff] group-focus-within/email:text-[#006cff] disabled:opacity-50"
                        >
                          <ArrowRight size={17} />
                        </button>
                        <span className="absolute inset-y-0 left-[-25%] w-[18%] skew-x-[-18deg] bg-white/60 blur-sm transition-transform duration-700 group-hover/email:translate-x-[720%] group-hover/email:bg-[#eaf5ff] group-focus-within/email:translate-x-[720%] group-focus-within/email:bg-[#eaf5ff]" />
                      </div>
                    </label>
                  </form>
                </div>

                {error && (
                  <p className="mt-5 text-center font-inter text-sm font-black text-white">
                    {error}
                  </p>
                )}

                <p className="mx-auto mt-6 max-w-[460px] text-center font-inter text-xs font-semibold leading-5 text-white/68">
                  By signing up, you agree to our{" "}
                  <Link
                    href="/terms"
                    className="font-black text-white underline decoration-[#7be7ff]/55 underline-offset-4 transition hover:text-[#dff7ff] hover:decoration-white"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="font-black text-white underline decoration-[#7be7ff]/55 underline-offset-4 transition hover:text-[#dff7ff] hover:decoration-white"
                  >
                    Privacy Policy
                  </Link>
                  .
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
                  className="mx-auto mb-8 flex items-center gap-2 font-inter text-sm font-bold text-white/72 transition hover:text-white"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <div className="mb-6 flex justify-center">
                  <div className="rounded-3xl border border-white/22 bg-white/12 p-3 shadow-[0_24px_70px_rgba(0,0,0,0.14),inset_0_1px_2px_rgba(255,255,255,0.22)] backdrop-blur-xl">
                    <OrbLogo size={58} />
                  </div>
                </div>

                <h1 className="font-inter text-[clamp(44px,7vw,76px)] font-black leading-[0.9] tracking-[-0.06em] text-white">
                  Enter your code
                </h1>

                <p className="mx-auto mt-5 max-w-[460px] font-inter text-lg font-semibold leading-8 text-white/74">
                  We sent a sign-in code to {email}.
                </p>

                <div className="mx-auto mt-10 max-w-[480px] rounded-[34px] border border-white/22 bg-white/12 p-3 shadow-[0_26px_88px_rgba(0,38,96,0.18),inset_0_1px_2px_rgba(255,255,255,0.22)] backdrop-blur-2xl">
                  <div className="rounded-[26px] border border-white/18 bg-white/10 px-4 py-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.20),0_18px_42px_rgba(0,38,96,0.12)]">
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
                      <InputOTPSeparator className="px-0 text-white/50" />
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
                  className="mt-6 font-inter text-sm font-black text-white transition hover:text-[#d7ecff] disabled:opacity-50"
                >
                  Resend code
                </button>

                {error && (
                  <p className="mt-5 font-inter text-sm font-black text-white">
                    {error}
                  </p>
                )}
              </motion.div>
            )}

            {step === "password" && (
              <motion.div
                key="password"
                {...panelMotion}
                className="mx-auto max-w-[520px] rounded-[34px] border border-white/22 bg-white/14 p-7 text-left shadow-[0_30px_110px_rgba(0,38,96,0.20),inset_0_1px_2px_rgba(255,255,255,0.22)] backdrop-blur-2xl sm:p-9"
              >
                <button
                  onClick={() => setStep("otp")}
                  className="mb-6 flex items-center gap-2 font-inter text-sm font-bold text-white/72 transition hover:text-white"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/16 text-white shadow-[0_12px_28px_rgba(0,38,96,0.12)]">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="font-inter text-xs font-black uppercase tracking-[0.2em] text-white/70">
                      Password
                    </p>
                    <h1 className="font-inter text-3xl font-black tracking-[-0.04em] text-white">
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
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/22 bg-white/14 text-white shadow-[0_22px_70px_rgba(0,38,96,0.18),inset_0_1px_2px_rgba(255,255,255,0.22)]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 18 }}
                >
                  <Check size={34} strokeWidth={2.8} />
                </motion.div>

                <h1 className="mt-7 font-inter text-[clamp(44px,7vw,76px)] font-black leading-[0.9] tracking-[-0.06em] text-white">
                  You&apos;re in
                </h1>

                <p className="mx-auto mt-5 max-w-[460px] font-inter text-lg font-semibold leading-8 text-white/74">
                  Continue to your dashboard.
                </p>

                <button
                  onClick={() => router.push("/dashboard")}
                  className="mt-10 h-14 w-full max-w-[460px] rounded-2xl bg-white px-5 font-inter text-base font-black text-[#006cff] shadow-[0_18px_48px_rgba(0,38,96,0.22)] transition hover:-translate-y-0.5 hover:bg-[#eef7ff]"
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
