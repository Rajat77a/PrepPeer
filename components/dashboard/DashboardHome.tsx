"use client";

import { useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { scoreDimensions } from "@/components/dashboard/DashboardData";
import type { DimensionScore, LeaderboardEntry } from "@/lib/types";

type DashboardHomeProps = {
  firstName: string;
  sessions: DashboardSession[];
  leaderboardEntries: LeaderboardEntry[];
  rankSummary: DashboardRankSummary | null;
  recentSessionScore: number | null;
};

export type DashboardSession = {
  id: string;
  date: string;
  role: string;
  experience: string;
  company: string;
  score: number;
  rank?: number;
  delta?: string;
};

export type DashboardRankSummary = {
  rank: number;
  totalCandidates: number;
  score: number;
  percentile: string;
  rankChange: string;
  role: string;
  companyType: string;
  dimensions?: DimensionScore[];
};

const createRankCardBlob = async ({
  firstName,
  rankSummary,
  recentSessionScore,
}: {
  firstName: string;
  rankSummary: DashboardRankSummary;
  recentSessionScore: number;
}) => {
  const canvas = document.createElement("canvas");
  const scale = 2;
  const width = 1200;
  const height = 630;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not create rank card.");

  ctx.scale(scale, scale);

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#06111f");
  bg.addColorStop(0.46, "#082c55");
  bg.addColorStop(1, "#05070c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(880, 120, 30, 880, 120, 440);
  glow.addColorStop(0, "rgba(0, 132, 255, 0.48)");
  glow.addColorStop(0.45, "rgba(0, 132, 255, 0.16)");
  glow.addColorStop(1, "rgba(0, 132, 255, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += 38) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += 38) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  roundRect(ctx, 66, 64, 1068, 502, 34);
  ctx.fill();
  ctx.strokeStyle = "rgba(96,177,255,0.28)";
  ctx.lineWidth = 2;
  ctx.stroke();

  const orb = ctx.createRadialGradient(166, 150, 14, 156, 150, 52);
  orb.addColorStop(0, "#f8ffff");
  orb.addColorStop(0.2, "#7df0ff");
  orb.addColorStop(0.58, "#0084ff");
  orb.addColorStop(0.82, "#083a9c");
  orb.addColorStop(1, "#050b25");
  ctx.fillStyle = orb;
  ctx.beginPath();
  ctx.arc(156, 150, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(125,255,217,0.55)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 34px Inter, Arial, sans-serif";
  ctx.fillText("PrepPeer", 224, 162);

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "700 21px Inter, Arial, sans-serif";
  ctx.fillText(`${firstName}'s live rank card`, 90, 262);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 140px Inter, Arial, sans-serif";
  ctx.fillText(`#${rankSummary.rank}`, 86, 402);

  ctx.fillStyle = "rgba(255,255,255,0.42)";
  ctx.font = "800 34px Inter, Arial, sans-serif";
  ctx.fillText(`of ${rankSummary.totalCandidates}`, 430, 396);

  ctx.fillStyle = "#60b1ff";
  ctx.font = "800 30px Inter, Arial, sans-serif";
  ctx.fillText(rankSummary.percentile, 92, 462);

  ctx.fillStyle = "rgba(255,255,255,0.38)";
  ctx.font = "700 24px Inter, Arial, sans-serif";
  ctx.fillText(`${rankSummary.role} / ${rankSummary.companyType}`, 92, 506);

  ctx.fillStyle = "rgba(0,108,255,0.18)";
  roundRect(ctx, 790, 172, 246, 246, 123);
  ctx.fill();
  ctx.strokeStyle = "rgba(96,177,255,0.35)";
  ctx.lineWidth = 5;
  ctx.stroke();

  const endAngle = -Math.PI / 2 + (Math.PI * 2 * recentSessionScore) / 100;
  ctx.strokeStyle = "rgba(255,255,255,0.13)";
  ctx.lineWidth = 20;
  ctx.beginPath();
  ctx.arc(913, 295, 92, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "#0084ff";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(913, 295, 92, -Math.PI / 2, endAngle);
  ctx.stroke();
  ctx.lineCap = "butt";

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 58px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(String(recentSessionScore), 913, 292);
  ctx.fillStyle = "rgba(255,255,255,0.42)";
  ctx.font = "800 20px Inter, Arial, sans-serif";
  ctx.fillText("recent score", 913, 326);
  ctx.textAlign = "left";

  ctx.fillStyle = "rgba(255,255,255,0.18)";
  roundRect(ctx, 742, 458, 342, 54, 27);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 20px Inter, Arial, sans-serif";
  ctx.fillText(rankSummary.rankChange, 772, 492);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not export rank card."));
    }, "image/png");
  });
};

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
};

export function DashboardHome({
  firstName,
  sessions,
  leaderboardEntries,
  rankSummary,
  recentSessionScore,
}: DashboardHomeProps) {
  if (sessions.length === 0 || !rankSummary) {
    return (
      <NewUserDashboard
        firstName={firstName}
        topEntries={leaderboardEntries.slice(0, 3)}
      />
    );
  }

  return (
    <ReturningDashboard
      firstName={firstName}
      sessions={sessions}
      leaderboardEntries={leaderboardEntries}
      rankSummary={rankSummary}
      recentSessionScore={recentSessionScore ?? sessions[0]?.score ?? rankSummary.score}
    />
  );
}

function NewUserDashboard({
  firstName,
  topEntries,
}: {
  firstName: string;
  topEntries: LeaderboardEntry[];
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-[#006cff]/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-12 text-center"
      >
        <h1 className="font-inter text-[clamp(42px,8vw,72px)] font-black leading-none tracking-[-0.04em] text-white">
          Welcome, {firstName}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-inter text-lg leading-8 text-white/40">
          Your rank is waiting. Take your first mock to find out where you stand.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        whileHover={{
          rotateX: -2,
          rotateY: 4,
          scale: 1.01,
          transition: { duration: 0.3 },
        }}
        style={{ transformStyle: "preserve-3d", perspective: 1000 }}
        className="relative mb-6 w-full max-w-2xl cursor-pointer overflow-hidden rounded-2xl border border-[#006cff]/20 bg-gradient-to-br from-[#0d1929] via-[#0a0f1a] to-[#080808] p-7 shadow-[0_24px_100px_rgba(0,0,0,0.45)] sm:p-10"
      >
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-[#006cff]/15 blur-[80px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#006cff]" />
            <span className="font-inter text-sm font-semibold text-white/40">
              Interview room ready
            </span>
          </div>
          <h2 className="font-inter text-[clamp(30px,5vw,48px)] font-black leading-tight tracking-[-0.04em] text-white">
            Start your first mock interview
          </h2>
          <p className="mb-8 mt-4 max-w-lg font-inter text-base leading-7 text-white/50">
            Five real questions. Scored on clarity, structure, confidence, and
            depth. See your rank among role-matched peers instantly.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/interview?mode=account"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006cff] px-8 py-3 font-inter text-sm font-bold text-white transition-all hover:bg-[#0057cc] hover:shadow-[0_0_20px_rgba(0,108,255,0.4)]"
            >
              Start Interview
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <p className="font-inter text-xs font-bold uppercase tracking-[0.2em] text-white/40">
            Live leaderboard
          </p>
          <Link
            href="/dashboard/leaderboard"
            className="font-inter text-xs font-bold text-[#006cff] hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="space-y-1">
          {topEntries.map((entry) => (
            <div
              key={entry.rank}
              className="flex items-center justify-between rounded-lg border-b border-white/[0.05] px-2 py-3 transition hover:bg-white/[0.02]"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="w-7 font-inter text-sm font-bold text-white/20">
                  #{entry.rank}
                </span>
                <div className="min-w-0">
                  <span className="font-inter text-sm font-semibold text-white">
                    {entry.name}
                  </span>
                  <span className="ml-2 font-inter text-xs text-white/30">
                    {entry.subtitle}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-inter text-sm font-semibold text-white/60">
                  {entry.score}
                </span>
                <span className="font-inter text-xs font-bold text-green-400">
                  {entry.delta}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center font-inter text-xs font-semibold text-white/20">
          Complete your first interview to appear on the leaderboard
        </p>
      </motion.div>
    </div>
  );
}

function ReturningDashboard({
  firstName,
  sessions,
  leaderboardEntries,
  rankSummary,
  recentSessionScore,
}: {
  firstName: string;
  sessions: DashboardSession[];
  leaderboardEntries: LeaderboardEntry[];
  rankSummary: DashboardRankSummary;
  recentSessionScore: number;
}) {
  const [shareState, setShareState] = useState<"idle" | "creating" | "done" | "error">("idle");
  const userIndex = leaderboardEntries.findIndex((entry) => entry.isYou);
  const nearby =
    userIndex >= 0
      ? leaderboardEntries.slice(Math.max(0, userIndex - 2), userIndex + 3)
      : leaderboardEntries.slice(0, 5);
  const dimensions: DimensionScore[] = rankSummary.dimensions?.length
    ? rankSummary.dimensions
    : scoreDimensions.map((dimension) => ({
        label: dimension.label,
        value: dimension.score,
      }));
  const latestSession = sessions[0];
  const practiceAgainHref = `/interview?mode=account&autostart=1&role=${encodeURIComponent(
    latestSession?.role ?? rankSummary.role
  )}&experience=${encodeURIComponent(
    latestSession?.experience ?? "Not set"
  )}&company=${encodeURIComponent(latestSession?.company ?? rankSummary.companyType)}`;
  const shareLabel =
    shareState === "creating"
      ? "Creating card..."
      : shareState === "done"
        ? "Rank card ready"
        : shareState === "error"
          ? "Try again"
          : "Share rank card";

  const shareRankCard = async () => {
    if (shareState === "creating") return;

    setShareState("creating");

    try {
      const blob = await createRankCardBlob({
        firstName,
        rankSummary,
        recentSessionScore,
      });
      const file = new File([blob], "preppeer-rank-card.png", {
        type: "image/png",
      });
      const shareData = {
        title: "PrepPeer rank card",
        text: `I am ranked #${rankSummary.rank} on PrepPeer.`,
        files: [file],
      };
      const navigatorWithShare = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean;
      };

      if (
        navigator.share &&
        (!navigatorWithShare.canShare || navigatorWithShare.canShare(shareData))
      ) {
        await navigator.share(shareData);
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "preppeer-rank-card.png";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }

      setShareState("done");
      window.setTimeout(() => setShareState("idle"), 2400);
    } catch {
      setShareState("error");
      window.setTimeout(() => setShareState("idle"), 2400);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-5 sm:p-8">
      <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-inter text-3xl font-black tracking-[-0.03em] text-white">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 font-inter text-white/40">
            Here is where you stand today.
          </p>
        </div>
        <Link
          href={practiceAgainHref}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#006cff] px-6 py-2.5 font-inter text-sm font-bold text-white transition hover:bg-[#0057cc] hover:shadow-[0_0_16px_rgba(0,108,255,0.4)]"
        >
          Practice again
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-3">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-2xl border border-[#006cff]/20 bg-gradient-to-br from-[#0d1929] to-[#080808] p-6 xl:col-span-2 xl:p-8"
        >
          <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-[#006cff]/10 blur-[100px]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
              backgroundSize: "18px 18px",
            }}
          />
          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-3 font-inter text-sm font-semibold text-white/40">
                Your current rank
              </p>
              <div className="mb-3 flex items-end gap-3">
                <span className="font-inter text-7xl font-black leading-none tracking-[-0.05em] text-white sm:text-8xl">
                  #{rankSummary.rank}
                </span>
                <span className="mb-3 font-inter text-xl font-bold text-white/30">
                  of {rankSummary.totalCandidates}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 font-inter text-sm">
                <span className="font-bold text-[#006cff]">
                  {rankSummary.rankChange}
                </span>
                <span className="text-white/20">/</span>
                <span className="text-white/40">{rankSummary.percentile}</span>
                <span className="text-white/20">/</span>
                <span className="text-white/40">{rankSummary.role}</span>
                <span className="text-white/20">/</span>
                <span className="text-white/40">{rankSummary.companyType}</span>
              </div>
            </div>
            <PercentileRing value={recentSessionScore} />
          </div>
          <div className="relative z-10 mt-6">
            <button
              type="button"
              onClick={shareRankCard}
              disabled={shareState === "creating"}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 font-inter text-xs font-bold text-white/30 transition hover:border-white/30 hover:text-white disabled:cursor-wait disabled:opacity-70"
            >
              {shareLabel}
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </motion.div>

        <div className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-6">
          <p className="mb-5 font-inter text-xs font-bold uppercase tracking-[0.2em] text-white/40">
            Score breakdown
          </p>
          <div className="flex-1 space-y-4">
            {dimensions.map((dim) => (
              <div key={dim.label}>
                <div className="mb-1.5 flex justify-between">
                  <span className="font-inter text-xs font-semibold text-white/50">
                    {dim.label}
                  </span>
                  <span className="font-inter text-xs font-bold text-white">
                    {dim.value}
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dim.value}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full rounded-full bg-[#006cff]"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-white/[0.05] pt-4">
            <p className="font-inter text-xs text-white/20">
              Weakest: <span className="text-white/50">Structure</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Recent sessions" href="/dashboard/sessions">
          {sessions.slice(0, 3).map((session) => (
            <Link
              key={session.id}
              href={`/dashboard/sessions/${session.id}`}
              className="flex items-center justify-between rounded-lg border-b border-white/[0.05] px-2 py-3 transition hover:bg-white/[0.02]"
            >
              <div>
                <p className="font-inter text-sm font-semibold text-white">
                  {session.date}
                </p>
                <p className="font-inter text-xs text-white/30">{session.role}</p>
              </div>
              <div className="flex items-center gap-4 font-inter text-sm">
                <span className="text-white/60">Score: {session.score}</span>
                <span className="text-white/40">
                  {session.rank ? `#${session.rank}` : "Not ranked"}
                </span>
                <span
                  className={
                    session.delta?.startsWith("↗")
                      ? "text-xs font-bold text-green-400"
                      : session.delta?.startsWith("↘")
                        ? "text-xs font-bold text-red-400"
                        : "text-xs font-bold text-white/35"
                  }
                >
                  {session.delta ?? "new entry"}
                </span>
              </div>
            </Link>
          ))}
        </Panel>

        <Panel title="Leaderboard" href="/dashboard/leaderboard">
          {nearby.map((entry) => (
            <div
              key={entry.rank}
              className={
                entry.isYou
                  ? "flex items-center justify-between rounded-lg border border-[#006cff]/20 bg-[#006cff]/10 px-2 py-3 transition"
                  : "flex items-center justify-between rounded-lg border-b border-white/[0.05] px-2 py-3 transition hover:bg-white/[0.02]"
              }
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    entry.isYou
                      ? "w-8 font-inter text-sm font-bold text-[#006cff]"
                      : "w-8 font-inter text-sm font-bold text-white/20"
                  }
                >
                  #{entry.rank}
                </span>
                <span
                  className={
                    entry.isYou
                      ? "font-inter text-sm font-bold text-white"
                      : "font-inter text-sm font-semibold text-white/60"
                  }
                >
                  {entry.name}
                </span>
              </div>
              <span
                className={
                  entry.isYou
                    ? "font-inter text-sm font-bold text-white"
                    : "font-inter text-sm font-semibold text-white/40"
                }
              >
                {entry.score}
              </span>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}

function PercentileRing({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 38;

  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="#006cff"
          strokeWidth="8"
          strokeDasharray={`${(value / 100) * circumference} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-inter text-xl font-black text-white">{value}</span>
        <span className="font-inter text-xs font-semibold text-white/30">
          recent score
        </span>
      </div>
    </div>
  );
}

function Panel({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="font-inter text-xs font-bold uppercase tracking-[0.2em] text-white/40">
          {title}
        </p>
        <Link
          href={href}
          className="font-inter text-xs font-bold text-[#006cff] hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
