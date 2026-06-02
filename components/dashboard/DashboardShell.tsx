"use client";

import {
  LayoutDashboard,
  LogOut,
  Medal,
  UserRound,
  History,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
};

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Sessions", href: "/dashboard/sessions", icon: History },
  { label: "Leaderboard", href: "/dashboard/leaderboard", icon: Medal },
  { label: "Profile", href: "/dashboard/profile", icon: UserRound },
];

const LIVE_REFRESH_MS = 5 * 60 * 1000;

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    const refreshLiveRanks = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };

    const interval = window.setInterval(refreshLiveRanks, LIVE_REFRESH_MS);
    document.addEventListener("visibilitychange", refreshLiveRanks);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshLiveRanks);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f7fbff] text-[#07111f]">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(0,132,255,0.12),transparent_28%),radial-gradient(circle_at_88%_46%,rgba(96,177,255,0.14),transparent_34%),linear-gradient(180deg,#ffffff_0%,#eef7ff_54%,#ffffff_100%)]"
        aria-hidden="true"
      />
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[240px] border-r border-[rgba(0,132,255,0.12)] bg-white/82 px-4 py-5 shadow-[18px_0_60px_rgba(0,108,255,0.06)] backdrop-blur-xl lg:block">
        <div className="pointer-events-none absolute left-0 top-0 h-32 w-full bg-[#006cff]/8 blur-2xl" />
        <div className="relative z-10">
          <Logo size="md" href={null} />
        </div>

        <nav className="relative z-10 mt-10 space-y-1">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onMouseEnter={() => router.prefetch(item.href)}
                onFocus={() => router.prefetch(item.href)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-3 font-inter text-sm font-bold text-[#5f6b7d] transition duration-200 hover:bg-[#eef7ff] hover:text-[#07111f]",
                  active &&
                    "border-[#006cff] bg-[#eaf5ff] text-[#07111f] shadow-[0_10px_40px_rgba(0,108,255,0.10)]"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4">
          <div className="flex items-center gap-3 rounded-xl border border-[rgba(0,132,255,0.12)] bg-white/70 p-3 shadow-[0_12px_32px_rgba(0,108,255,0.07)]">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#006cff] font-inter text-sm font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-inter text-sm font-bold text-[#07111f]">
                {user.name}
              </p>
              <p className="truncate font-inter text-xs font-semibold text-[#64748b]">
                {user.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="mt-3 flex w-full items-center gap-2 px-3 py-2 font-inter text-xs font-bold text-[#64748b] transition hover:text-[#006cff]"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="relative z-10 min-h-screen pb-24 lg:ml-[240px] lg:pb-0">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-4 border-t border-[rgba(0,132,255,0.12)] bg-white/92 px-3 py-2 shadow-[0_-18px_50px_rgba(0,108,255,0.08)] backdrop-blur-xl lg:hidden">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onMouseEnter={() => router.prefetch(item.href)}
              onFocus={() => router.prefetch(item.href)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl py-2 font-inter text-[11px] font-bold text-[#64748b] transition",
                active && "bg-[#eaf5ff] text-[#07111f]"
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-[#006cff]")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
