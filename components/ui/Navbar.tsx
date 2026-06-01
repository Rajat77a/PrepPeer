"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "./Button";
import { NavSectionLink } from "./NavSectionLink";
import { NavSparkles } from "./NavSparkles";
import { NAV_LINKS } from "@/lib/mockData";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";

interface NavbarProps {
  variant?: "landing" | "inner";
  sessionLabel?: string;
  progress?: { current: number; total: number };
  homeHref?: string;
}

export function Navbar({
  variant = "landing",
  sessionLabel,
  progress,
  homeHref = "/",
}: NavbarProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const activeSection = useScrollSpy(
    ["home", "how-it-works", "features", "leaderboard-preview", "see-it-in-action"],
    140
  );

  if (variant === "inner") {
    return (
      <header className="sticky top-0 z-[100] bg-white/95 backdrop-blur-md border-b border-[rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 max-w-[1200px] mx-auto">
          <Logo href={homeHref} />
          {sessionLabel && (
            <span className="font-inter font-medium text-sm text-muted hidden sm:block">
              Session: {sessionLabel}
            </span>
          )}
          {progress && (
            <span className="font-inter font-semibold text-sm text-blue">
              Q {progress.current} of {progress.total}
            </span>
          )}
        </div>
        {progress && (
          <div className="h-[3px] bg-[#EEF2F7]">
            <div
              className="h-full bg-gradient-to-r from-blue-light to-blue transition-all duration-300"
              style={{
                width: `${(progress.current / progress.total) * 100}%`,
              }}
            />
          </div>
        )}
      </header>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.05 }}
      className="fixed top-0 left-0 right-0 z-[100] pt-4 sm:pt-5 flex justify-center px-3 sm:px-6 pointer-events-none"
    >
      <nav
        className={cn(
          "glass-nav pointer-events-auto relative",
          "flex w-full max-w-[1100px] items-stretch gap-2.5 sm:items-center sm:gap-4",
          "px-4 py-3 sm:px-5 sm:py-3 rounded-[28px] sm:rounded-full"
        )}
      >
        <NavSparkles />
        <div className="relative z-[1] flex w-full flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center justify-between gap-3 sm:contents">
            <Logo />

            <Link
              href="/interview"
              className="relative z-[1] inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[rgba(0,132,255,0.18)] bg-white/55 px-3 py-1.5 font-inter text-[12px] font-extrabold text-blue shadow-[inset_0_1px_1px_rgba(255,255,255,0.75),0_8px_20px_rgba(0,132,255,0.12)] backdrop-blur-md transition active:scale-[0.98] sm:hidden"
            >
              Start
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue text-white">
                <ArrowRight size={12} strokeWidth={2.6} />
              </span>
            </Link>
          </div>

          <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-3 gap-y-1.5 sm:flex-1 sm:flex-nowrap sm:gap-4 sm:overflow-x-auto md:gap-6 scrollbar-none">
            {NAV_LINKS.map((link) => (
              <NavSectionLink
                key={link.label}
                item={link}
                active={isHome && activeSection === link.sectionId}
                compact
              />
            ))}
          </div>

          <div className="shrink-0 hidden sm:block">
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-inter text-sm font-semibold text-text transition hover:bg-white/10"
              >
                Sign in
              </Link>
              <Button href="/interview" variant="glass" showArrow>
                Start Free
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </motion.div>
  );
}
