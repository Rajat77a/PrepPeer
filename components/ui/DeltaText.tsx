"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DeltaTextProps {
  children: ReactNode;
  type?: "up" | "down" | "neutral" | "light";
  size?: "xs" | "sm";
  className?: string;
}

/** Rank movement — plain text, no pill */
export function DeltaText({
  children,
  type = "up",
  size = "sm",
  className,
}: DeltaTextProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 font-inter font-semibold",
        size === "xs" ? "text-[10px]" : "text-[11px]",
        type === "down"
          ? "text-coral"
          : type === "neutral"
            ? "text-muted"
            : type === "light"
              ? "text-[#7DFFD9]"
              : "text-green",
        className
      )}
    >
      <span
        className={cn(
          "h-px w-4",
          type === "down"
            ? "bg-coral"
            : type === "neutral"
              ? "bg-muted/40"
              : type === "light"
                ? "bg-[#7DFFD9]"
                : "bg-green"
        )}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}
