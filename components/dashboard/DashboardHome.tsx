"use client";

import { useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { scoreDimensions } from "@/components/dashboard/DashboardData";
import type { DimensionScore, LeaderboardEntry } from "@/lib/types";

type DashboardProfileContext = {
  role: string;
  experience: string;
  companyType: string;
};

type DashboardHomeProps = {
  firstName: string;
  sessions: DashboardSession[];
  leaderboardEntries: LeaderboardEntry[];
  rankSummary: DashboardRankSummary | null;
  recentSessionScore: number | null;
  profileContext: DashboardProfileContext;
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
  experience?: string;
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
  profileContext,
}: DashboardHomeProps) {
  if (sessions.length === 0 || !rankSummary) {
    return (
      <NewUserDashboard
        firstName={firstName}
        topEntries={leaderboardEntries.slice(0, 3)}
        profileContext={profileContext}
      />
    );
  }

  return (
    <ReturningDashboard
      firstName={firstName}
      sessions={sessions}
      leaderboardEntries={leaderboardEntries}
      rankSummary={rankSummary}
      profileContext={profileContext}
      recentSessionScore={
        recentSessionScore ?? sessions[0]?.score ?? rankSummary.score
      }
    />
  );
}

function NewUserDashboard({
  firstName,
  topEntries,
  profileContext,
}: {
  firstName: string;
  topEntries: LeaderboardEntry[];
  profileContext: DashboardProfileContext;
}) {
  const startInterviewHref = `/interview?mode=account&autostart=1&role=${encodeURIComponent(
    profileContext.role || "Interview"
  )}&experience=${encodeURIComponent(
    profileContext.experience || "Not set"
  )}&company=${encodeURIComponent(profileContext.companyType || "General")}`;

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
        <h1 className="font-inter text-[clamp(42px,8vw,72px)] font-black leading-none tracking-[-0.04em] text-[#07111f]">
          Welcome, {firstName}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-inter text-lg font-medium leading-8 text-[#64748b]">
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
        className="relative mb-6 w-full max-w-2xl cursor-pointer overflow-hidden rounded-2xl border border-[#006cff]/16 bg-white/86 p-7 shadow-[0_24px_80px_rgba(0,108,255,0.12)] backdrop-blur-xl sm:p-10"
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
            <span className="font-inter text-sm font-bold text-[#64748b]">
              Interview room ready
            </span>
          </div>

          <h2 className="font-inter text-[clamp(30px,5vw,48px)] font-black leading-tight tracking-[-0.04em] text-[#07111f]">
            Start your first mock interview
          </h2>

          <p className="mb-5 mt-4 max-w-lg font-inter text-base font-medium leading-7 text-[#64748b]">
            Five real questions. Scored on clarity, structure, confidence, and
            depth. See your rank among role-matched peers instantly.
          </p>

          <div className="mb-8 flex flex-wrap gap-2">
            <span className="rounded-full border border-[#006cff]/14 bg-[#f7fbff] px-3 py-1.5 font-inter text-xs font-bold text-[#64748b]">
              {profileContext.role}
            </span>
            <span className="rounded-full border border-[#006cff]/14 bg-[#f7fbff] px-3 py-1.5 font-inter text-xs font-bold text-[#64748b]">
              {profileContext.experience}
            </span>
            <span className="rounded-full border border-[#006cff]/14 bg-[#f7fbff] px-3 py-1.5 font-inter text-xs font-bold text-[#64748b]">
              {profileContext.companyType}
            </span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href={startInterviewHref}
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
        className="w-full max-w-2xl rounded-2xl border border-[rgba(0,132,255,0.12)] bg-white/86 p-6 shadow-[0_18px_60px_rgba(0,108,255,0.09)] backdrop-blur-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <p className="font-inter text-xs font-bold uppercase tracking-[0.2em] text-[#64748b]">
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
              className="flex items-center justify-between rounded-lg border-b border-[rgba(0,132,255,0.08)] px-2 py-3 transition hover:bg-[#f7fbff]"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="w-7 font-inter text-sm font-bold text-[#9aa9bb]">
                  #{entry.rank}
                </span>
                <div className="min-w-0">
                  <span className="font-inter text-sm font-bold text-[#07111f]">
                    {entry.name}
                  </span>
                  <span className="ml-2 font-inter text-xs font-semibold text-[#64748b]">
                    {entry.subtitle}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-inter text-sm font-bold text-[#07111f]">
                  {entry.score}
                </span>
                <span className="font-inter text-xs font-bold text-green-400">
                  {entry.delta}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center font-inter text-xs font-semibold text-[#64748b]">
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
  profileContext,
  recentSessionScore,
}: {
  firstName: string;
  sessions: DashboardSession[];
  leaderboardEntries: LeaderboardEntry[];
  rankSummary: DashboardRankSummary;
  profileContext: DashboardProfileContext;
  recentSessionScore: number;
}) {
  const [shareState, setShareState] = useState<
    "idle" | "creating" | "done" | "error"
  >("idle");

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
    profileContext.role || rankSummary.role
  )}&experience=${encodeURIComponent(
    profileContext.experience ||
      rankSummary.experience ||
      latestSession?.experience ||
      "Not set"
  )}&company=${encodeURIComponent(
    profileContext.companyType || rankSummary.companyType
  )}`;

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
    <div className="relative mx-auto max-w-6xl p-5 sm:p-8">
      <div className="pointer-events-none absolute right-0 top-4 h-52 w-52 rounded-full bg-[#7dffd9]/24 blur-[84px]" />
      <div className="pointer-events-none absolute left-1/3 top-28 h-64 w-64 rounded-full bg-[#006cff]/12 blur-[96px]" />
      <div className="pointer-events-none absolute bottom-12 right-1/4 h-40 w-40 rounded-full bg-[#ffbe3d]/10 blur-[70px]" />

      <div className="relative z-10 mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 font-inter text-xs font-black uppercase tracking-[0.22em] text-[#006cff]">
            Live practice room
          </p>
          <h1 className="font-inter text-3xl font-black tracking-[-0.03em] text-[#07111f] sm:text-4xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 font-inter font-medium text-[#64748b]">
            Here is where you stand today.
          </p>
        </div>

        <motion.div whileHover={{ y: -3, scale: 1.015 }} whileTap={{ scale: 0.98 }}>
          <Link
            href={practiceAgainHref}
            className="group relative inline-flex min-w-[230px] items-center justify-center overflow-hidden rounded-[28px] border border-[#60b1ff]/35 bg-[linear-gradient(135deg,#07111f_0%,#063f8f_48%,#006cff_100%)] px-7 py-3.5 font-inter text-sm font-black text-white shadow-[0_20px_50px_rgba(0,49,112,0.34)] transition-all duration-500 hover:border-[#9bd4ff]/70 hover:bg-[linear-gradient(135deg,#020817_0%,#082c55_46%,#0057cc_100%)] hover:shadow-[0_24px_70px_rgba(0,49,112,0.48)]"
          >
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(155,212,255,0.34),transparent_28%),radial-gradient(circle_at_82%_78%,rgba(0,108,255,0.38),transparent_30%)] opacity-0 transition duration-500 group-hover:opacity-100" />
            <span className="absolute inset-y-[-35%] left-[-42%] w-[38%] rotate-12 bg-[#d9efff]/45 blur-lg transition duration-700 ease-out group-hover:left-[116%]" />
            <span className="absolute inset-[3px] rounded-[24px] border border-white/10 transition duration-500 group-hover:border-[#9bd4ff]/45" />
            <span className="relative z-10 flex items-center gap-3">
              <span>Practice again</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/14 text-white transition duration-500 group-hover:translate-x-1 group-hover:bg-[#006cff] group-hover:text-white group-hover:shadow-[0_0_22px_rgba(96,177,255,0.55)]">
                <ArrowRight className="h-4 w-4" />
              </span>
            </span>
          </Link>
        </motion.div>
      </div>

      <div className="relative z-10 mb-6 grid gap-4 xl:grid-cols-3">
        <motion.div
          whileHover={{
            y: -8,
            rotateX: 2.2,
            rotateY: -3.2,
            scale: 1.012,
            transition: { duration: 0.32, ease: "easeOut" },
          }}
          style={{ transformPerspective: 1200, transformStyle: "preserve-3d" }}
          className="group relative overflow-hidden rounded-[30px] border border-[#006cff]/18 bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_0%,rgba(231,245,255,0.90)_46%,rgba(232,255,248,0.78)_100%)] p-6 shadow-[0_34px_100px_rgba(0,108,255,0.18)] backdrop-blur-xl xl:col-span-2 xl:p-8"
        >
          <div className="pointer-events-none absolute -right-16 -top-20 h-80 w-80 rounded-full bg-[#006cff]/18 blur-[90px] transition duration-500 group-hover:scale-110" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-[#7dffd9]/22 blur-[90px] transition duration-500 group-hover:translate-x-8" />
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(0,132,255,0.10) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          <div
            className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between"
            style={{ transform: "translateZ(34px)" }}
          >
            <div>
              <p className="mb-3 font-inter text-sm font-bold text-[#64748b]">
                Your current rank
              </p>
              <div className="mb-3 flex items-end gap-3">
                <span className="bg-[linear-gradient(135deg,#07111f_0%,#006cff_78%)] bg-clip-text font-inter text-7xl font-black leading-none tracking-[-0.05em] text-transparent sm:text-8xl">
                  #{rankSummary.rank}
                </span>
                <span className="mb-3 font-inter text-xl font-bold text-[#64748b]">
                  of {rankSummary.totalCandidates}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 font-inter text-sm">
                <span className="font-bold text-[#006cff]">
                  {rankSummary.rankChange}
                </span>
                <span className="text-[#b7c6d8]">/</span>
                <span className="font-semibold text-[#64748b]">
                  {rankSummary.percentile}
                </span>
                <span className="text-[#b7c6d8]">/</span>
                <span className="font-semibold text-[#64748b]">
                  {rankSummary.role}
                </span>
                <span className="text-[#b7c6d8]">/</span>
                <span className="font-semibold text-[#64748b]">
                  {rankSummary.companyType}
                </span>
              </div>
            </div>
            <PercentileRing value={recentSessionScore} />
          </div>

          <div
            className="relative z-10 mt-6"
            style={{ transform: "translateZ(28px)" }}
          >
            <button
              type="button"
              onClick={shareRankCard}
              disabled={shareState === "creating"}
              className="inline-flex items-center gap-2 rounded-full border border-[#006cff]/16 bg-[#f7fbff] px-4 py-1.5 font-inter text-xs font-bold text-[#64748b] transition hover:border-[#006cff]/35 hover:text-[#006cff] disabled:cursor-wait disabled:opacity-70"
            >
              {shareLabel}
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </motion.div>

        <motion.div
          whileHover={{
            y: -7,
            rotateX: 2,
            rotateY: 3,
            transition: { duration: 0.3, ease: "easeOut" },
          }}
          style={{ transformPerspective: 1000, transformStyle: "preserve-3d" }}
          className="relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-[rgba(0,132,255,0.16)] bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(231,244,255,0.84))] p-6 shadow-[0_24px_70px_rgba(0,108,255,0.12)] backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute -right-16 top-10 h-40 w-40 rounded-full bg-[#60b1ff]/24 blur-[52px]" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-1 w-full bg-[linear-gradient(90deg,#006cff,#7dffd9,#ffbe3d)]" />
          <p className="mb-5 font-inter text-xs font-bold uppercase tracking-[0.2em] text-[#64748b]">
            Score breakdown
          </p>
          <div
            className="relative z-10 flex-1 space-y-4"
            style={{ transform: "translateZ(24px)" }}
          >
            {dimensions.map((dim) => (
              <div key={dim.label}>
                <div className="mb-1.5 flex justify-between">
                  <span className="font-inter text-xs font-bold text-[#64748b]">
                    {dim.label}
                  </span>
                  <span className="font-inter text-xs font-bold text-[#07111f]">
                    {dim.value}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#dceeff]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dim.value}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full rounded-full bg-[linear-gradient(90deg,#006cff,#60b1ff,#7dffd9)]"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-[rgba(0,132,255,0.10)] pt-4">
            <p className="font-inter text-xs font-semibold text-[#64748b]">
              Weakest: <span className="text-[#07111f]">Structure</span>
            </p>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 grid gap-4 xl:grid-cols-2">
        <Panel title="Recent sessions" href="/dashboard/sessions">
          {sessions.slice(0, 3).map((session) => (
            <Link
              key={session.id}
              href={`/dashboard/sessions/${session.id}`}
              className="flex items-center justify-between rounded-lg border-b border-[rgba(0,132,255,0.08)] px-2 py-3 transition hover:bg-[#f7fbff]"
            >
              <div>
                <p className="font-inter text-sm font-bold text-[#07111f]">
                  {session.date}
                </p>
                <p className="font-inter text-xs font-semibold text-[#64748b]">
                  {session.role}
                </p>
              </div>
              <div className="flex items-center gap-4 font-inter text-sm">
                <span className="font-semibold text-[#07111f]">
                  Score: {session.score}
                </span>
                <span className="font-semibold text-[#64748b]">
                  {session.rank ? `#${session.rank}` : "Not ranked"}
                </span>
                <span
                  className={
                    session.delta?.startsWith("↗")
                      ? "text-xs font-bold text-green-400"
                      : session.delta?.startsWith("↘")
                        ? "text-xs font-bold text-red-400"
                        : "text-xs font-bold text-[#64748b]"
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
                  ? "flex items-center justify-between rounded-lg border border-[#006cff]/20 bg-[#eaf5ff] px-2 py-3 transition"
                  : "flex items-center justify-between rounded-lg border-b border-[rgba(0,132,255,0.08)] px-2 py-3 transition hover:bg-[#f7fbff]"
              }
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    entry.isYou
                      ? "w-8 font-inter text-sm font-bold text-[#006cff]"
                      : "w-8 font-inter text-sm font-bold text-[#9aa9bb]"
                  }
                >
                  #{entry.rank}
                </span>
                <span
                  className={
                    entry.isYou
                      ? "font-inter text-sm font-bold text-[#07111f]"
                      : "font-inter text-sm font-bold text-[#41516a]"
                  }
                >
                  {entry.name}
                </span>
              </div>
              <span
                className={
                  entry.isYou
                    ? "font-inter text-sm font-bold text-[#07111f]"
                    : "font-inter text-sm font-bold text-[#64748b]"
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
    <div
      className="relative h-32 w-32 shrink-0"
      style={{ transform: "translateZ(44px)" }}
    >
      <div className="absolute -inset-4 rounded-full bg-[radial-gradient(circle,rgba(0,108,255,0.16),rgba(125,255,217,0.08)_44%,transparent_72%)] blur-2xl" />
      <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_160deg,rgba(0,108,255,0.24),rgba(32,196,255,0.22),rgba(125,255,217,0.30),rgba(255,255,255,0.82),rgba(0,108,255,0.24))] shadow-[0_24px_55px_rgba(0,108,255,0.20)]" />
      <div className="absolute inset-2 rounded-full bg-[linear-gradient(145deg,rgba(255,255,255,0.90),rgba(231,245,255,0.66))] backdrop-blur-xl" />
      <div className="absolute left-7 top-5 h-7 w-12 -rotate-12 rounded-full bg-white/70 blur-md" />
      <svg viewBox="0 0 100 100" className="relative h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="rgba(0,108,255,0.12)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="url(#scoreRingGradient)"
          strokeWidth="8"
          strokeDasharray={`${(value / 100) * circumference} ${circumference}`}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="scoreRingGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#006cff" />
            <stop offset="58%" stopColor="#20c4ff" />
            <stop offset="100%" stopColor="#7dffd9" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-inter text-xl font-black text-[#07111f]">
          {value}
        </span>
        <span className="font-inter text-xs font-semibold text-[#64748b]">
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
    <motion.div
      whileHover={{
        y: -6,
        rotateX: 1.4,
        rotateY: 1.8,
        transition: { duration: 0.28, ease: "easeOut" },
      }}
      style={{ transformPerspective: 1000, transformStyle: "preserve-3d" }}
      className="relative overflow-hidden rounded-[28px] border border-[rgba(0,132,255,0.13)] bg-[linear-gradient(145deg,rgba(255,255,255,0.93),rgba(239,248,255,0.84)_62%,rgba(238,255,250,0.72))] p-6 shadow-[0_24px_76px_rgba(0,108,255,0.12)] backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full bg-[#006cff]/12 blur-[46px]" />
      <div className="pointer-events-none absolute left-8 top-0 h-px w-1/2 bg-[linear-gradient(90deg,transparent,#006cff66,transparent)]" />
      <div className="mb-5 flex items-center justify-between">
        <p className="font-inter text-xs font-bold uppercase tracking-[0.2em] text-[#64748b]">
          {title}
        </p>
        <Link
          href={href}
          className="font-inter text-xs font-bold text-[#006cff] hover:underline"
        >
          View all
        </Link>
      </div>
      <div
        className="relative z-10 space-y-1"
        style={{ transform: "translateZ(20px)" }}
      >
        {children}
      </div>
    </motion.div>
  );
}
