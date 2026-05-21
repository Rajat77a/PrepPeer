"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EASE_OUT, ONCE_VIEWPORT } from "@/lib/motion";

type Direction = "up" | "left" | "right" | "none";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: Direction;
}

function getOffset(direction: Direction) {
  switch (direction) {
    case "left":
      return { x: -48, y: 0 };
    case "right":
      return { x: 48, y: 0 };
    case "none":
      return { x: 0, y: 12 };
    default:
      return { x: 0, y: 36 };
  }
}

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 0.65,
  direction = "up",
}: ScrollRevealProps) {
  const offset = getOffset(direction);

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={ONCE_VIEWPORT}
      transition={{ duration, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
