"use client";

import {
  OTPInput,
  OTPInputContext,
  type SlotProps,
} from "input-otp";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const inputOTPVariants = cva("flex items-center justify-center gap-1.5 sm:gap-2", {
  variants: {
    otpSize: {
      sm: "gap-1",
      default: "gap-1.5 sm:gap-2",
      lg: "gap-2 sm:gap-3",
    },
  },
  defaultVariants: {
    otpSize: "default",
  },
});

export interface InputOTPProps {
  maxLength: number;
  value?: string;
  onChange?: (newValue: string) => void;
  onComplete?: (newValue: string) => void;
  disabled?: boolean;
  pattern?: string;
  className?: string;
  containerClassName?: string;
  children?: React.ReactNode;
  otpSize?: "sm" | "default" | "lg";
}

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  InputOTPProps
>(({ className, containerClassName, children, otpSize, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(inputOTPVariants({ otpSize }), containerClassName)}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  >
    {children}
  </OTPInput>
));
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & VariantProps<typeof inputOTPVariants>
>(({ className, otpSize, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(inputOTPVariants({ otpSize }), className)}
    {...props}
  />
));
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    index: number;
    animated?: boolean;
    otpSize?: "sm" | "default" | "lg";
  }
>(({ index, className, animated = true, otpSize = "default", ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];
  const sizes = {
    sm: "h-9 w-8 text-sm",
    default: "h-12 w-10 sm:w-11 text-lg",
    lg: "h-14 w-12 sm:w-14 text-xl",
  };

  const slotContent = (
    <div
      ref={ref}
      data-active={isActive}
      data-filled={Boolean(char)}
      className={cn(
        "relative flex items-center justify-center rounded-2xl border bg-white/80 font-inter font-bold text-[#07111f] shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_12px_30px_rgba(0,132,255,0.08)] backdrop-blur-xl transition-all duration-300",
        sizes[otpSize],
        char && "border-[#38bdf8]/45 bg-[#f0f9ff] text-[#006cff]",
        isActive
          ? "border-[#38bdf8] shadow-[0_0_0_3px_rgba(56,189,248,0.18),0_12px_34px_rgba(0,108,255,0.22)]"
          : "border-white/80",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <motion.div
            className="h-5 w-px bg-[#0084ff]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}
    </div>
  );

  if (!animated) return slotContent;

  return (
    <motion.div
      initial={{ scale: 0.84, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.045, ease: "easeOut" }}
    >
      {slotContent}
    </motion.div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    className={cn("text-sm font-semibold text-[#7b8da3]/45", className)}
    {...props}
  >
    -
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

interface AnimatedInputOTPProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function OtpSlot({ index, ...slot }: SlotProps & { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035, type: "spring", stiffness: 260, damping: 22 }}
      className={cn(
        "relative flex h-12 w-11 items-center justify-center rounded-xl border border-white/80 bg-white/80 font-inter text-lg font-bold text-[#07111f] shadow-[0_12px_30px_rgba(0,132,255,0.08)] transition",
        slot.isActive && "border-[#006cff] shadow-[0_0_0_3px_rgba(0,108,255,0.24)]"
      )}
    >
      {slot.char}
      {slot.hasFakeCaret && (
        <span className="absolute h-5 w-px animate-pulse bg-[#0084ff]" />
      )}
    </motion.div>
  );
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

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  inputOTPVariants,
};
