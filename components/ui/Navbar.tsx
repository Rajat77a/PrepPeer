"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
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
          <div className="flex items-center justify-center gap-3 sm:contents">
            <Logo />
          </div>

          <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-3 gap-y-1.5 sm:flex-1 sm:flex-nowrap sm:gap-4 sm:overflow-x-auto md:gap-7 scrollbar-none">
            {NAV_LINKS.map((link) => (
              <NavSectionLink
                key={link.label}
                item={link}
                active={isHome && activeSection === link.sectionId}
                compact
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:hidden">
            <Link
              href="/login"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[#07111f]/10 bg-white/72 px-4 py-2.5 text-center font-inter text-sm font-extrabold tracking-[-0.02em] text-[#07111f] shadow-[0_10px_24px_rgba(0,108,255,0.10)] backdrop-blur-xl transition active:scale-[0.98]"
            >
              Sign in
            </Link>
            <Link
              href="/login?mode=signup"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[#006cff]/20 bg-[#07111f] px-4 py-2.5 text-center font-inter text-sm font-extrabold tracking-[-0.02em] text-white shadow-[0_12px_30px_rgba(7,17,31,0.16)] transition active:scale-[0.98]"
            >
              Sign up
            </Link>
          </div>

          <div className="shrink-0 hidden sm:block">
            <div className="flex items-center">
              <Link
                href="/login"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[#07111f]/10 bg-[#07111f] px-5 py-2.5 font-inter text-sm font-extrabold tracking-[-0.02em] text-white shadow-[0_12px_30px_rgba(7,17,31,0.16)] transition hover:-translate-y-0.5 hover:bg-[#006cff] hover:shadow-[0_16px_34px_rgba(0,108,255,0.22)]"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </motion.div>
  );
}
