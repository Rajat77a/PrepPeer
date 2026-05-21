"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";

interface HoverCardProps {
  children: ReactNode;
  className?: string;
}

export default function HoverCard({ children, className }: HoverCardProps) {
  return (
    <motion.div
      className={cn("transform-gpu", className)}
      whileHover={{
        scale: 1.04,
        y: -8,
        boxShadow: "0 24px 56px rgba(0, 132, 255, 0.14)",
      }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}
