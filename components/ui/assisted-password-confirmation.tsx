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
      <div className="rounded-[22px] border border-[#28415f]/70 bg-[#0d1828]/82 p-4 shadow-[0_24px_76px_rgba(0,0,0,0.32),0_0_48px_rgba(0,108,255,0.1),inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-xl">
        <label className="mb-2 block font-inter text-xs font-bold uppercase tracking-[0.18em] text-[#60b1ff]">
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
          glowColor="#60b1ff"
          className="border-[#28415f]/80 bg-[#0d1828]/88 text-[#f4f8ff] shadow-[0_18px_50px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.08)] placeholder:text-[#71839a] focus:border-[#9fcfff]/70 focus:bg-[#111f33]"
        />

        <div className="mt-4 rounded-2xl border border-[#28415f]/70 bg-[#06111f]/72 p-3">
          <p className="mb-2 font-inter text-xs font-semibold text-[#8ca0ba]">
            Confirmation trail
          </p>
          <motion.div
            className="relative flex min-h-12 items-center overflow-hidden rounded-xl border border-[#28415f]/70 bg-[#0b1422] px-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]"
            animate={{
              x: shake ? [-9, 9, -7, 7, 0] : 0,
              borderColor: passwordsMatch ? "rgba(96,177,255,0.85)" : "rgba(40,65,95,0.7)",
              scale: passwordsMatch ? [1, 1.015, 1] : 1,
            }}
            transition={{ duration: 0.38 }}
          >
            <div className="relative z-10 flex h-9 items-center">
              {password ? (
                password.split("").map((_, index) => (
                  <span
                    key={index}
                    className="mx-[5px] h-1.5 w-1.5 rounded-full bg-[#f4f8ff]"
                  />
                ))
              ) : (
                <span className="font-inter text-sm text-[#71839a]">
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

        <label className="mb-2 mt-4 block font-inter text-xs font-bold uppercase tracking-[0.18em] text-[#60b1ff]">
          Confirm password
        </label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          placeholder="Type it again"
          autoComplete="new-password"
          glowColor={passwordsMatch ? "#16a34a" : "#60b1ff"}
          className="border-[#28415f]/80 bg-[#0d1828]/88 text-[#f4f8ff] shadow-[0_18px_50px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.08)] placeholder:text-[#71839a] focus:border-[#9fcfff]/70 focus:bg-[#111f33]"
        />
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-[#28415f]/70 bg-[#0d1828]/78 p-3 shadow-[0_18px_48px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <motion.div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border",
            passwordsMatch
              ? "border-[#60b1ff]/35 bg-[#132238] text-[#9fcfff]"
              : "border-[#28415f] bg-[#06111f] text-[#71839a]"
          )}
          animate={{ scale: passwordsMatch ? 1 : 0.92, rotate: passwordsMatch ? 0 : -8 }}
          transition={{ type: "spring", stiffness: 360, damping: 18 }}
        >
          <Check size={18} strokeWidth={2.8} />
        </motion.div>
        <p className="font-inter text-sm text-[#a8b5c7]">
          {passwordsMatch
            ? "Matched. Your account is ready."
            : "Use 8+ characters. The trail checks the confirm password as you type."}
        </p>
      </div>

      {error && <p className="font-inter text-sm text-[#ff8a8a]">{error}</p>}

      <button
        type="submit"
        disabled={!passwordsMatch || loading}
        className="group relative w-full overflow-hidden rounded-full border border-[#28415f]/70 bg-[#0d1828]/86 px-5 py-3.5 font-inter text-sm font-bold text-[#f4f8ff] shadow-[0_24px_76px_rgba(0,0,0,0.28)] transition duration-300 hover:border-[#f4f8ff]/70 hover:bg-[#f4f8ff] hover:text-[#06111f] hover:shadow-[0_0_48px_rgba(244,248,255,0.22),0_24px_76px_rgba(0,0,0,0.42)] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <span className="relative z-10">{loading ? "Saving..." : "Create account"}</span>
        <span className="absolute inset-y-0 left-[-25%] w-[22%] skew-x-[-18deg] bg-white/28 blur-sm transition-transform duration-700 group-hover:translate-x-[620%]" />
      </button>
    </form>
  );
}
