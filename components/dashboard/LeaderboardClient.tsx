"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/lib/types";
import { RefreshTableButton } from "@/components/dashboard/RefreshTableButton";

const tabs = ["All Roles", "SDE", "PM", "Operations", "MBA", "SRE"];

const roleMatches: Record<string, string[]> = {
  "All Roles": [],
  SDE: ["SDE", "SDE Fresher"],
  PM: ["Product Manager"],
  Operations: ["Operations"],
  MBA: ["MBA"],
  SRE: ["Lead Site Reliability Engineer", "SRE"],
};

const formatMovement = (
  delta?: string,
  deltaType?: LeaderboardEntry["deltaType"]
) => {
  if (!delta) return "steady";

  const normalized = delta.toLowerCase().trim();
  const amount = delta.match(/\d+/)?.[0];

  if (normalized.includes("steady")) return "steady";
  if (normalized.includes("new entry")) return "new entry";
  if (!amount) return delta.replace(/^[^0-9A-Za-z+-]+/, "").trim();

  if (deltaType === "up") {
    return `+${amount} ${amount === "1" ? "position" : "positions"}`;
  }

  if (deltaType === "down") {
    return `-${amount} ${amount === "1" ? "position" : "positions"}`;
  }

  return delta.replace(/^[^0-9A-Za-z+-]+/, "").trim();
};

export function LeaderboardClient({
  entries: initialEntries,
  loadError,
}: {
  entries: LeaderboardEntry[];
  loadError?: string;
}) {
  const [activeTab, setActiveTab] = useState("All Roles");
  const [query, setQuery] = useState("");

  const entries = useMemo(() => {
    const allowedRoles = roleMatches[activeTab] ?? [];
    const normalizedQuery = query.trim().toLowerCase();

    return initialEntries.filter((entry) => {
      const searchableText = `${entry.name} ${entry.subtitle ?? ""}`;
      const roleText = entry.role ?? "";
      const roleAllowed =
        allowedRoles.length === 0 ||
        allowedRoles.some((role) => roleText.includes(role));
      const textAllowed =
        normalizedQuery.length === 0 ||
        `${searchableText} ${roleText} ${entry.companyType ?? ""}`
          .toLowerCase()
          .includes(normalizedQuery);

      return roleAllowed && textAllowed;
    });
  }, [activeTab, initialEntries, query]);

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-8">
      <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="font-inter text-xs font-bold uppercase tracking-[0.22em] text-[#006cff]">
            Leaderboard
          </p>
          <h1 className="mt-3 font-inter text-[clamp(38px,6vw,72px)] font-black leading-none tracking-[-0.05em] text-[#07111f]">
            The ranked board.
          </h1>
          <p className="mt-4 max-w-2xl font-inter text-base font-medium leading-7 text-[#64748b]">
            Compare score, session count, and movement across role-matched peers.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:w-auto">
          <div className="relative w-full xl:w-[340px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8ba0b8]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, occupation, role"
              className="h-12 w-full rounded-full border border-[rgba(0,132,255,0.14)] bg-white/88 pl-11 pr-4 font-inter text-sm font-semibold text-[#07111f] outline-none shadow-[0_12px_32px_rgba(0,108,255,0.07)] transition placeholder:text-[#9aa9bb] focus:border-[#006cff]/60 focus:shadow-[0_0_24px_rgba(0,108,255,0.14)]"
            />
          </div>
          <RefreshTableButton label="Refresh board" />
        </div>
      </div>

      {loadError && (
        <div
          role="alert"
          className="mb-5 border-l-4 border-[#006cff] bg-white/85 px-5 py-4 font-inter text-sm font-bold text-[#32445b] shadow-[0_12px_34px_rgba(0,108,255,0.08)]"
        >
          {loadError}
        </div>
      )}

      <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "shrink-0 rounded-full border border-[rgba(0,132,255,0.12)] bg-white/70 px-4 py-2 font-inter text-sm font-bold text-[#64748b] transition hover:border-[#006cff]/30 hover:bg-[#eef7ff] hover:text-[#07111f]",
              activeTab === tab &&
                "border-[#006cff]/35 bg-[#eaf5ff] text-[#07111f] shadow-[0_0_30px_rgba(0,108,255,0.12)]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[rgba(0,132,255,0.12)] bg-white/88 shadow-[0_18px_60px_rgba(0,108,255,0.08)] backdrop-blur-xl">
        <div className="sticky top-0 z-10 hidden grid-cols-[0.7fr_1.2fr_1.4fr_1fr_0.8fr_0.8fr_0.8fr] gap-4 rounded-t-2xl border-b border-[rgba(0,132,255,0.10)] bg-white/95 px-5 py-4 font-inter text-xs font-bold uppercase tracking-[0.16em] text-[#64748b] backdrop-blur-xl lg:grid">
          <span>Rank</span>
          <span>Name</span>
          <span>Context</span>
          <span>Status</span>
          <span>Score</span>
          <span>Sessions</span>
          <span>Movement</span>
        </div>

        <div className="divide-y divide-[rgba(0,132,255,0.08)]">
          {entries.map((entry) => (
            <div
              key={`${entry.rank}-${entry.name}`}
              className={cn(
                "grid gap-3 px-5 py-4 transition hover:bg-[#f7fbff] lg:grid-cols-[0.7fr_1.2fr_1.4fr_1fr_0.8fr_0.8fr_0.8fr] lg:items-center lg:gap-4",
                entry.isYou &&
                  "border-y border-[#006cff]/20 bg-[#eaf5ff] hover:bg-[#dff0ff]"
              )}
            >
              <span
                className={cn(
                  "font-inter text-sm font-black",
                  entry.isYou ? "text-[#006cff]" : "text-[#8ba0b8]"
                )}
              >
                #{entry.rank}
              </span>

              <span className="font-inter text-sm font-bold text-[#07111f]">
                {entry.name}
              </span>

              <span className="font-inter text-sm font-semibold text-[#64748b]">
                {entry.subtitle ?? "-"}
              </span>

              <span className="font-inter text-sm font-semibold text-[#64748b]">
                {entry.sessions ? `${entry.sessions} sessions` : "No sessions yet"}
              </span>

              <span className="font-inter text-sm font-bold text-[#07111f]">
                {entry.score}
              </span>

              <span className="font-inter text-sm font-semibold text-[#64748b]">
                {entry.sessions}
              </span>

              <span
                className={cn(
                  "inline-flex items-center font-inter text-sm font-black tracking-[-0.01em]",
                  entry.deltaType === "up"
                    ? "text-[#08b86f]"
                    : entry.deltaType === "down"
                      ? "text-[#006cff]"
                      : "text-[#07111f]"
                )}
              >
                {formatMovement(entry.delta, entry.deltaType)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
