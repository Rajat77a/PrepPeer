"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
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
}

export function Navbar({
  variant = "landing",
  sessionLabel,
  progress,
}: NavbarProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const activeSection = useScrollSpy(
    ["home", "how-it-works", "features", "leaderboard-preview", "pricing"],
    140
  );

  if (variant === "inner") {
    return (
      <header className="sticky top-0 z-[100] bg-white/95 backdrop-blur-md border-b border-[rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 max-w-[1200px] mx-auto">
          <Logo />
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
          "flex items-center gap-2 sm:gap-4 w-full max-w-[1100px]",
          "px-3 sm:px-5 py-2.5 sm:py-3 rounded-full"
        )}
      >
        <NavSparkles />
        <div className="relative z-[1] flex items-center gap-2 sm:gap-4 w-full">
          <Logo />

          <div className="flex flex-1 items-center justify-center gap-2 sm:gap-4 md:gap-6 min-w-0 overflow-x-auto scrollbar-none">
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
            <Button href="/interview" variant="glass" showArrow>
              Start Free
            </Button>
          </div>

          <Link
            href="/interview"
            className="sm:hidden shrink-0 font-inter font-semibold text-xs text-blue px-2 py-1 cursor-pointer relative z-[1]"
          >
            Start
          </Link>
        </div>
      </nav>
    </motion.div>
  );
}
