"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { leaderboardEntries } from "@/components/dashboard/DashboardData";
import { cn } from "@/lib/utils";

const tabs = ["All Roles", "SDE", "PM", "Operations", "MBA"];

const roleMatches: Record<string, string[]> = {
  "All Roles": [],
  SDE: ["SDE", "SDE Fresher"],
  PM: ["Product Manager"],
  Operations: ["Operations"],
  MBA: ["MBA"],
};

export function LeaderboardClient() {
  const [activeTab, setActiveTab] = useState("All Roles");
  const [query, setQuery] = useState("");

  const entries = useMemo(() => {
    const allowedRoles = roleMatches[activeTab] ?? [];
    const normalizedQuery = query.trim().toLowerCase();

    return leaderboardEntries.filter((entry) => {
      const roleAllowed =
        allowedRoles.length === 0 || allowedRoles.includes(entry.role);
      const textAllowed =
        normalizedQuery.length === 0 ||
        `${entry.name} ${entry.college} ${entry.role}`
          .toLowerCase()
          .includes(normalizedQuery);

      return roleAllowed && textAllowed;
    });
  }, [activeTab, query]);

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-8">
      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="font-inter text-xs font-bold uppercase tracking-[0.22em] text-[#006cff]">
            Leaderboard
          </p>
          <h1 className="mt-3 font-inter text-[clamp(38px,6vw,72px)] font-black leading-none tracking-[-0.05em] text-white">
            The ranked board.
          </h1>
          <p className="mt-4 max-w-2xl font-inter text-base leading-7 text-white/40">
            Compare score, session count, and movement across role-matched peers.
          </p>
        </div>

        <div className="relative w-full xl:w-[340px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, college, role"
            className="h-12 w-full rounded-full border border-white/[0.08] bg-[#0d0d0d] pl-11 pr-4 font-inter text-sm font-semibold text-white outline-none transition placeholder:text-white/20 focus:border-[#006cff]/60 focus:shadow-[0_0_24px_rgba(0,108,255,0.14)]"
          />
        </div>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "shrink-0 rounded-full border border-white/[0.08] px-4 py-2 font-inter text-sm font-bold text-white/35 transition hover:text-white/70",
              activeTab === tab &&
                "border-[#006cff]/35 bg-[#006cff]/15 text-white shadow-[0_0_30px_rgba(0,108,255,0.12)]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0d]">
        <div className="sticky top-0 z-10 hidden grid-cols-[0.7fr_1.2fr_1.4fr_1fr_0.8fr_0.8fr_0.8fr] gap-4 border-b border-white/[0.08] bg-[#0d0d0d]/95 px-5 py-4 font-inter text-xs font-bold uppercase tracking-[0.16em] text-white/30 backdrop-blur-xl lg:grid">
          <span>Rank</span>
          <span>Name</span>
          <span>College</span>
          <span>Role</span>
          <span>Score</span>
          <span>Sessions</span>
          <span>Delta</span>
        </div>

        <div className="max-h-[70vh] divide-y divide-white/[0.055] overflow-auto">
          {entries.map((entry) => (
            <div
              key={`${entry.rank}-${entry.name}`}
              className={cn(
                "grid gap-3 px-5 py-4 transition hover:bg-white/[0.025] lg:grid-cols-[0.7fr_1.2fr_1.4fr_1fr_0.8fr_0.8fr_0.8fr] lg:items-center lg:gap-4",
                entry.isUser &&
                  "border-y border-[#006cff]/20 bg-[#006cff]/10 hover:bg-[#006cff]/12"
              )}
            >
              <span
                className={cn(
                  "font-inter text-sm font-black",
                  entry.isUser ? "text-[#006cff]" : "text-white/35"
                )}
              >
                #{entry.rank}
              </span>
              <span className="font-inter text-sm font-bold text-white">
                {entry.name}
              </span>
              <span className="font-inter text-sm font-semibold text-white/45">
                {entry.college}
              </span>
              <span className="font-inter text-sm font-semibold text-white/45">
                {entry.role}
              </span>
              <span className="font-inter text-sm font-bold text-white">
                {entry.score}
              </span>
              <span className="font-inter text-sm font-semibold text-white/45">
                {entry.sessions}
              </span>
              <span
                className={cn(
                  "font-inter text-sm font-bold",
                  entry.delta.startsWith("+") ? "text-green-400" : "text-red-400"
                )}
              >
                {entry.delta}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
