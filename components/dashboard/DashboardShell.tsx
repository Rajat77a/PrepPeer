"use client";

import {
  LayoutDashboard,
  LogOut,
  Medal,
  UserRound,
  History,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const [signOutError, setSignOutError] = useState("");

  const signOut = async () => {
    setSignOutError("");
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) {
      setSignOutError("Could not sign out. Please try again.");
      return;
    }
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
    <div className="min-h-screen overflow-hidden bg-[#f7fbff] text-[#07111f]">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(0,108,255,0.18),transparent_26%),radial-gradient(circle_at_82%_18%,rgba(125,255,217,0.18),transparent_24%),radial-gradient(circle_at_78%_82%,rgba(255,190,61,0.12),transparent_28%),linear-gradient(180deg,#ffffff_0%,#edf7ff_48%,#ffffff_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(0,108,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(0,108,255,0.035)_1px,transparent_1px)] bg-[size:54px_54px]"
        aria-hidden="true"
      />
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[240px] border-r border-[rgba(0,132,255,0.14)] bg-white/76 px-4 py-5 shadow-[24px_0_80px_rgba(0,108,255,0.10)] backdrop-blur-2xl lg:block">
        <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-[#006cff]/13 blur-[70px]" />
        <div className="pointer-events-none absolute bottom-20 right-[-70px] h-48 w-48 rounded-full bg-[#7dffd9]/16 blur-[72px]" />
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
                  "flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 font-inter text-sm font-bold text-[#5f6b7d] transition duration-200 hover:-translate-y-0.5 hover:border-[#006cff]/12 hover:bg-white/82 hover:text-[#07111f] hover:shadow-[0_14px_34px_rgba(0,108,255,0.10)]",
                  active &&
                    "border-[#006cff]/18 bg-[linear-gradient(135deg,rgba(234,245,255,0.96),rgba(255,255,255,0.78))] text-[#07111f] shadow-[0_14px_42px_rgba(0,108,255,0.13)]"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4">
          <div className="relative overflow-hidden rounded-2xl border border-[rgba(0,132,255,0.14)] bg-white/78 p-3 shadow-[0_18px_44px_rgba(0,108,255,0.12)] backdrop-blur-xl">
            <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-[#006cff]/12 blur-2xl" />
            <div className="relative z-10 flex items-center gap-3">
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
          </div>
          <button
            type="button"
            onClick={signOut}
            className="mt-3 flex w-full items-center gap-2 px-3 py-2 font-inter text-xs font-bold text-[#64748b] transition hover:text-[#006cff]"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out everywhere
          </button>
          {signOutError ? (
            <p className="px-3 font-inter text-[11px] font-semibold text-[#dc2626]">
              {signOutError}
            </p>
          ) : null}
        </div>
      </aside>

      <main className="relative z-10 min-h-screen pb-24 lg:ml-[240px] lg:pb-0">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-4 border-t border-[rgba(0,132,255,0.12)] bg-white/88 px-3 py-2 shadow-[0_-18px_50px_rgba(0,108,255,0.12)] backdrop-blur-2xl lg:hidden">
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
