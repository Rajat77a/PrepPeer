"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DeltaTextProps {
  children: ReactNode;
  type?: "up" | "down" | "light";
  size?: "xs" | "sm";
  className?: string;
}

/** Rank change — plain text, no pill */
export function DeltaText({
  children,
  type = "up",
  size = "sm",
  className,
}: DeltaTextProps) {
  return (
    <span
      className={cn(
        "font-inter font-semibold shrink-0",
        size === "xs" ? "text-[10px]" : "text-[11px]",
        type === "down"
          ? "text-coral"
          : type === "light"
            ? "text-[#7DFFD9]"
            : "text-green",
        className
      )}
    >
      {children}
    </span>
  );
}
