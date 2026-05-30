"use client";

import {
  OTPInput,
  type SlotProps,
} from "input-otp";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedInputOTPProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function AnimatedInputOTP({
  value,
  onChange,
  disabled,
}: AnimatedInputOTPProps) {
  return (
    <OTPInput
      maxLength={6}
      value={value}
      onChange={onChange}
      disabled={disabled}
      containerClassName="flex justify-center"
      render={({ slots }) => (
        <div className="flex gap-2">
          {slots.map((slot, index) => (
            <OtpSlot key={index} index={index} {...slot} />
          ))}
        </div>
      )}
    />
  );
}

function OtpSlot({ index, ...slot }: SlotProps & { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035, type: "spring", stiffness: 260, damping: 22 }}
      className={cn(
        "relative flex h-12 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] font-inter text-lg font-bold text-white transition",
        slot.isActive && "border-[#006cff] shadow-[0_0_0_3px_rgba(0,108,255,0.24)]"
      )}
    >
      {slot.char}
      {slot.hasFakeCaret && (
        <span className="absolute h-5 w-px animate-pulse bg-white" />
      )}
    </motion.div>
  );
}
