import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { recentSessions } from "@/components/dashboard/DashboardData";

export const metadata: Metadata = {
  title: "Sessions",
};

export default function DashboardSessionsPage() {
  return (
    <div className="mx-auto max-w-6xl p-5 sm:p-8">
      <div className="mb-8">
        <p className="font-inter text-xs font-bold uppercase tracking-[0.22em] text-[#006cff]">
          Session history
        </p>
        <h1 className="mt-3 font-inter text-[clamp(36px,6vw,64px)] font-black leading-none tracking-[-0.05em] text-white">
          Every attempt, in order.
        </h1>
        <p className="mt-4 max-w-2xl font-inter text-base leading-7 text-white/40">
          Review scores, role context, rank movement, and the session that changed
          your standing.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0d]">
        <div className="hidden grid-cols-[1.05fr_1fr_1fr_1.15fr_0.7fr_0.7fr_0.7fr_48px] gap-4 border-b border-white/[0.08] px-5 py-4 font-inter text-xs font-bold uppercase tracking-[0.16em] text-white/30 lg:grid">
          <span>Date</span>
          <span>Role</span>
          <span>Experience</span>
          <span>Company</span>
          <span>Score</span>
          <span>Rank</span>
          <span>Rank change</span>
          <span />
        </div>

        <div className="divide-y divide-white/[0.06]">
          {recentSessions.map((session) => (
            <Link
              key={session.id}
              href={`/dashboard/sessions/${session.id}`}
              className="grid gap-3 px-5 py-5 transition hover:bg-white/[0.025] lg:grid-cols-[1.05fr_1fr_1fr_1.15fr_0.7fr_0.7fr_0.7fr_48px] lg:items-center lg:gap-4"
            >
              <div>
                <p className="font-inter text-sm font-bold text-white">
                  {session.date}
                </p>
                <p className="mt-1 font-inter text-xs text-white/25 lg:hidden">
                  {session.company}
                </p>
              </div>
              <span className="font-inter text-sm font-semibold text-white/55">
                {session.role}
              </span>
              <span className="font-inter text-sm text-white/40">
                {session.experience}
              </span>
              <span className="hidden font-inter text-sm text-white/40 lg:block">
                {session.company}
              </span>
              <span className="font-inter text-sm font-bold text-white">
                {session.score}
              </span>
              <span className="font-inter text-sm font-bold text-white/60">
                #{session.rank}
              </span>
              <span
                className={
                  session.delta.startsWith("+")
                    ? "font-inter text-sm font-bold text-green-400"
                    : "font-inter text-sm font-bold text-red-400"
                }
              >
                {session.delta}
              </span>
              <ArrowUpRight className="hidden h-4 w-4 text-white/20 lg:block" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
