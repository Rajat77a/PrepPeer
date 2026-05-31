"use client";

import {
  LayoutDashboard,
  LogOut,
  Medal,
  UserRound,
  History,
} from "lucide-react";
import Link from "next/link";
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

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[240px] border-r border-white/[0.05] bg-[#0a0a0a] px-4 py-5 lg:block">
        <div className="pointer-events-none absolute left-0 top-0 h-32 w-full bg-[#006cff]/5 blur-2xl" />
        <div className="relative z-10">
          <Logo variant="light" size="md" href={null} />
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
                  "flex items-center gap-3 rounded-lg border-l-2 border-transparent px-3 py-3 font-inter text-sm font-semibold text-white/40 transition duration-200 hover:bg-white/[0.035] hover:text-white/70",
                  active &&
                    "border-[#006cff] bg-white/[0.05] text-white shadow-[0_10px_40px_rgba(0,108,255,0.08)]"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4">
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#006cff] font-inter text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-inter text-sm font-bold text-white">
                {user.name}
              </p>
              <p className="truncate font-inter text-xs text-white/30">
                {user.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="mt-3 flex w-full items-center gap-2 px-3 py-2 font-inter text-xs font-semibold text-white/30 transition hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-h-screen pb-24 lg:ml-[240px] lg:pb-0">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-4 border-t border-white/[0.05] bg-[#0a0a0a]/95 px-3 py-2 backdrop-blur-xl lg:hidden">
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
                "flex flex-col items-center justify-center gap-1 rounded-xl py-2 font-inter text-[11px] font-semibold text-white/35 transition",
                active && "bg-white/[0.05] text-white"
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
