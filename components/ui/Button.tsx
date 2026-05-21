"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";

type ButtonVariant = "primary" | "secondary" | "glass" | "ghost" | "navy-cta";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: ButtonVariant;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  fullWidth?: boolean;
  showArrow?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2.5 font-inter transform-gpu cursor-pointer";

const variants: Record<ButtonVariant, string> = {
  primary: `${base} px-[26px] py-3.5 rounded-2xl bg-[rgba(0,132,255,0.85)] backdrop-blur-sm border border-[rgba(0,132,255,0.3)] text-white font-semibold text-base shadow-cta-primary`,
  secondary: `${base} px-[22px] py-3.5 rounded-2xl bg-[rgba(255,255,255,0.4)] border border-[rgba(0,0,0,0.08)] shadow-[inset_0px_2px_4px_rgba(255,255,255,0.5)] font-medium text-[15px] text-text`,
  glass: `${base} gap-2 px-[18px] py-2 rounded-[10px] bg-[rgba(255,255,255,0.5)] border border-[rgba(0,0,0,0.1)] shadow-[inset_0px_2px_4px_rgba(255,255,255,0.6)] font-medium text-sm text-text`,
  ghost: `${base} px-4 py-2.5 rounded-xl font-semibold text-sm`,
  "navy-cta": `${base} px-[26px] py-3.5 rounded-2xl bg-white text-navy font-semibold text-base shadow-[0_8px_24px_rgba(0,0,0,0.15)] border-none`,
};

const hoverProps = {
  primary: {
    whileHover: {
      scale: 1.03,
      boxShadow:
        "inset 0px 4px 4px rgba(255,255,255,0.35), 0 16px 40px rgba(0,132,255,0.5)",
    },
    whileTap: { scale: 0.98 },
  },
  secondary: {
    whileHover: { scale: 1.02, backgroundColor: "rgba(255,255,255,0.7)" },
    whileTap: { scale: 0.98 },
  },
  glass: {
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.98 },
  },
  ghost: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
  },
  "navy-cta": {
    whileHover: {
      scale: 1.02,
      boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
    },
    whileTap: { scale: 0.98 },
  },
} as const;

export function Button({
  children,
  href,
  variant = "primary",
  className,
  onClick,
  disabled,
  type = "button",
  fullWidth,
  showArrow,
}: ButtonProps) {
  const classes = cn(
    variants[variant],
    fullWidth && "w-full",
    disabled && "opacity-50 pointer-events-none",
    className
  );
  const hover = hoverProps[variant];

  const arrow =
    showArrow !== false && variant === "primary" ? (
      <span className="w-7 h-7 rounded-full bg-[rgba(255,255,255,0.25)] flex items-center justify-center">
        <ArrowRight size={14} className="text-white" />
      </span>
    ) : showArrow && variant === "glass" ? (
      <ArrowRight size={14} className="text-blue" />
    ) : null;

  const content = (
    <>
      {children}
      {arrow}
    </>
  );

  if (href) {
    return (
      <motion.div
        whileHover={hover.whileHover}
        whileTap={hover.whileTap}
        transition={{ duration: 0.25, ease: EASE_OUT }}
        style={{ willChange: "transform" }}
        className={cn(fullWidth && "w-full")}
      >
        <Link href={href} className={classes}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      whileHover={hover.whileHover}
      whileTap={hover.whileTap}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      style={{ willChange: "transform" }}
    >
      {content}
    </motion.button>
  );
}
