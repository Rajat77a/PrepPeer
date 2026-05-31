"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, LayoutDashboard, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Logo } from "./Logo";
import { Button } from "./Button";
import { NavSectionLink } from "./NavSectionLink";
import { NavSparkles } from "./NavSparkles";
import { NAV_LINKS } from "@/lib/mockData";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/lib/motion";
import { createClient } from "@/utils/supabase/client";

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
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = pathname === "/";
  const activeSection = useScrollSpy(
    ["home", "how-it-works", "features", "leaderboard-preview", "see-it-in-action"],
    140
  );

  useEffect(() => {
    let mounted = true;
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (mounted) setUser(data.user);
      });
    } catch {
      setUser(null);
    }

    return () => {
      mounted = false;
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    router.push("/");
  };

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
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen((open) => !open)}
                    className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/10"
                    aria-label="Open account menu"
                  >
                    {user.user_metadata?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.user_metadata.avatar_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-inter text-sm font-bold text-text">
                        {(user.user_metadata?.full_name ?? user.email ?? "U")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-12 w-44 rounded-2xl border border-[rgba(0,0,0,0.08)] bg-white p-2 shadow-[0_18px_55px_rgba(0,0,0,0.14)]">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          router.push("/dashboard");
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-inter text-sm font-semibold text-text transition hover:bg-[#F3F7FC]"
                      >
                        <LayoutDashboard size={15} />
                        Dashboard
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 font-inter text-sm font-semibold text-text transition hover:bg-[#F3F7FC]"
                      >
                        <LogOut size={15} />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-inter text-sm font-semibold text-text transition hover:bg-white/10"
                >
                  Sign in
                </button>
              )}
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
