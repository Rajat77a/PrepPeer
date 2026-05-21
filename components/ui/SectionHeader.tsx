"use client";

import { motion } from "framer-motion";
import { EASE_OUT, ONCE_VIEWPORT } from "@/lib/motion";

interface SectionHeaderProps {
  chip?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}

const LABEL_TRANSITION = { duration: 1.2, ease: EASE_OUT };

export function SectionHeader({
  chip,
  title,
  subtitle,
  align = "center",
  className = "",
}: SectionHeaderProps) {
  const isCenter = align === "center";
  const wrapClass = isCenter
    ? "max-w-2xl mx-auto text-center"
    : "max-w-2xl text-left";

  return (
    <motion.div
      className={`${wrapClass} ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={ONCE_VIEWPORT}
      transition={{ duration: 0.5, ease: EASE_OUT }}
    >
      {chip && (
        <motion.p
          className={`section-label mb-4 block ${isCenter ? "mx-auto w-fit" : ""}`}
          style={{ transformOrigin: isCenter ? "center center" : "left center" }}
          initial={{ opacity: 0, scale: 0.88, rotate: -4 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={ONCE_VIEWPORT}
          transition={LABEL_TRANSITION}
        >
          {chip}
        </motion.p>
      )}
      <h2 className="section-title text-text">{title}</h2>
      {subtitle && (
        <p className="font-inter text-base text-muted mt-4 leading-[1.65]">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
