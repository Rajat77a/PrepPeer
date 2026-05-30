"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AssistedPasswordConfirmationProps {
  onSubmit: (password: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export function AssistedPasswordConfirmation({
  onSubmit,
  loading,
  error,
}: AssistedPasswordConfirmationProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [shake, setShake] = useState(false);
  const passwordsMatch = password.length >= 8 && password === confirmPassword;

  const letterStatus = useMemo(
    () =>
      password.split("").map((letter, index) => ({
        letter,
        status: !confirmPassword[index]
          ? "empty"
          : confirmPassword[index] === letter
            ? "match"
            : "miss",
      })),
    [confirmPassword, password]
  );

  useEffect(() => {
    if (!shake) return;
    const timer = setTimeout(() => setShake(false), 460);
    return () => clearTimeout(timer);
  }, [shake]);

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextValue = e.target.value;
    if (
      password.length > 0 &&
      nextValue.length > password.length &&
      nextValue.length > confirmPassword.length
    ) {
      setShake(true);
      return;
    }
    setConfirmPassword(nextValue);
  };

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (passwordsMatch) void onSubmit(password);
      }}
    >
      <div className="rounded-[22px] border border-white/10 bg-[#030914]/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <label className="mb-2 block font-inter text-xs font-bold uppercase tracking-[0.18em] text-[#7dd3fc]">
          Password
        </label>
        <Input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (confirmPassword) setConfirmPassword("");
          }}
          placeholder="Create a strong password"
          autoComplete="new-password"
        />

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/35 p-3">
          <p className="mb-2 font-inter text-xs font-semibold text-white/45">
            Confirmation trail
          </p>
          <motion.div
            className="relative flex min-h-12 items-center overflow-hidden rounded-xl border border-white/10 bg-[#07111f] px-3"
            animate={{
              x: shake ? [-9, 9, -7, 7, 0] : 0,
              borderColor: passwordsMatch ? "rgba(22,163,74,0.85)" : "rgba(255,255,255,0.10)",
              scale: passwordsMatch ? [1, 1.015, 1] : 1,
            }}
            transition={{ duration: 0.38 }}
          >
            <div className="relative z-10 flex h-9 items-center">
              {password ? (
                password.split("").map((_, index) => (
                  <span
                    key={index}
                    className="mx-[5px] h-1.5 w-1.5 rounded-full bg-white"
                  />
                ))
              ) : (
                <span className="font-inter text-sm text-white/25">
                  Match feedback appears here
                </span>
              )}
            </div>
            <div className="absolute inset-y-0 left-3 z-0 flex items-center">
              {letterStatus.map((item, index) => (
                <motion.span
                  key={`${item.letter}-${index}`}
                  className={cn(
                    "mx-[5px] h-8 w-1.5 rounded-full",
                    item.status === "match" && "bg-[#16a34a]/55",
                    item.status === "miss" && "bg-[#dc2626]/60",
                    item.status === "empty" && "bg-transparent"
                  )}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: item.status === "empty" ? 0 : 1 }}
                  transition={{ duration: 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        <label className="mb-2 mt-4 block font-inter text-xs font-bold uppercase tracking-[0.18em] text-[#7dd3fc]">
          Confirm password
        </label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          placeholder="Type it again"
          autoComplete="new-password"
          glowColor={passwordsMatch ? "#16a34a" : "#38bdf8"}
        />
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
        <motion.div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border",
            passwordsMatch
              ? "border-[#16a34a]/40 bg-[#16a34a]/20 text-[#86efac]"
              : "border-white/10 bg-white/[0.04] text-white/25"
          )}
          animate={{ scale: passwordsMatch ? 1 : 0.92, rotate: passwordsMatch ? 0 : -8 }}
          transition={{ type: "spring", stiffness: 360, damping: 18 }}
        >
          <Check size={18} strokeWidth={2.8} />
        </motion.div>
        <p className="font-inter text-sm text-white/50">
          {passwordsMatch
            ? "Matched. Your account is ready to lock in."
            : "Use 8+ characters. Green marks mean the confirm password is tracking correctly."}
        </p>
      </div>

      {error && <p className="font-inter text-sm text-[#f87171]">{error}</p>}

      <button
        type="submit"
        disabled={!passwordsMatch || loading}
        className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-[#0ea5e9] via-[#006cff] to-[#1d4ed8] px-5 py-3.5 font-inter text-sm font-bold text-white shadow-[0_18px_50px_rgba(0,108,255,0.34)] transition hover:shadow-[0_22px_70px_rgba(56,189,248,0.34)] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <span className="relative z-10">{loading ? "Saving..." : "Create account"}</span>
        <span className="absolute inset-y-0 left-[-25%] w-[22%] skew-x-[-18deg] bg-white/28 blur-sm transition-transform duration-700 group-hover:translate-x-[620%]" />
      </button>
    </form>
  );
}
