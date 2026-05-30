"use client";

import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
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
  const [confirmation, setConfirmation] = useState("");
  const matches = password.length >= 8 && password === confirmation;

  const letters = useMemo(() => {
    const length = Math.max(password.length, confirmation.length);
    return Array.from({ length }).map((_, index) => ({
      char: confirmation[index] ?? "",
      state:
        !confirmation[index] || !password[index]
          ? "empty"
          : confirmation[index] === password[index]
            ? "match"
            : "miss",
    }));
  }, [confirmation, password]);

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (matches) void onSubmit(password);
      }}
    >
      <div>
        <label className="mb-2 block font-inter text-sm font-semibold text-white">
          Create password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 font-inter text-white outline-none transition placeholder:text-white/25 focus:border-[#006cff] focus:shadow-[0_0_0_3px_rgba(0,108,255,0.22)]"
          placeholder="Minimum 8 characters"
        />
      </div>

      <div>
        <label className="mb-2 block font-inter text-sm font-semibold text-white">
          Confirm password
        </label>
        <input
          type="password"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 font-inter text-white outline-none transition placeholder:text-white/25 focus:border-[#006cff] focus:shadow-[0_0_0_3px_rgba(0,108,255,0.22)]"
          placeholder="Type it again"
        />
      </div>

      <div className="min-h-8 rounded-2xl border border-white/10 bg-black/30 p-3">
        <div className="flex flex-wrap gap-1.5">
          {letters.length ? (
            letters.map((item, index) => (
              <motion.span
                key={`${item.char}-${index}`}
                className={cn(
                  "flex h-7 min-w-7 items-center justify-center rounded-lg px-2 font-inter text-sm font-bold",
                  item.state === "match" && "bg-[#16a34a]/15 text-[#4ade80]",
                  item.state === "miss" && "bg-[#dc2626]/15 text-[#f87171]",
                  item.state === "empty" && "bg-white/5 text-white/30"
                )}
                animate={{ scale: item.state === "match" ? 1.05 : 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
              >
                {item.char || " "}
              </motion.span>
            ))
          ) : (
            <span className="font-inter text-sm text-white/30">
              Matching appears here as you confirm.
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <motion.div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border",
            matches
              ? "border-[#16a34a]/30 bg-[#16a34a]/20 text-[#4ade80]"
              : "border-white/10 bg-white/[0.04] text-white/30"
          )}
          animate={{ scale: matches ? 1 : 0.92 }}
          transition={{ type: "spring", stiffness: 360, damping: 18 }}
        >
          {matches ? <Check size={18} /> : <X size={16} />}
        </motion.div>
        <p className="font-inter text-sm text-white/45">
          {matches ? "Passwords match." : "Use at least 8 characters and match both fields."}
        </p>
      </div>

      {error && <p className="font-inter text-sm text-[#f87171]">{error}</p>}

      <button
        type="submit"
        disabled={!matches || loading}
        className="w-full rounded-full bg-[#006cff] px-5 py-3.5 font-inter text-sm font-bold text-white shadow-[0_18px_42px_rgba(0,108,255,0.32)] transition hover:bg-[#0b7cff] disabled:cursor-not-allowed disabled:opacity-45"
      >
        {loading ? "Saving..." : "Continue"}
      </button>
    </form>
  );
}
