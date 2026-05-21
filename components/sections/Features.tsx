"use client";

import { MessageSquare, Share2, Trophy, Zap } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import HoverCard from "@/components/ui/HoverCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { OrbLogo } from "@/components/ui/OrbLogo";
import AnimatedScoreBar from "@/components/ui/AnimatedScoreBar";
import { FEATURE_DIMENSIONS, MINI_LEADERBOARD } from "@/lib/mockData";
import { DeltaText } from "@/components/ui/DeltaText";
import { cn } from "@/lib/utils";

function RankBadge({ rank, isYou }: { rank: number; isYou?: boolean }) {
  if (rank === 1)
    return (
      <span className="w-7 h-7 rounded-full bg-gold text-[#412402] font-inter font-bold text-xs flex items-center justify-center shrink-0">
        #1
      </span>
    );
  if (isYou)
    return (
      <span className="w-7 h-7 rounded-full bg-blue text-white font-inter font-bold text-xs flex items-center justify-center shrink-0">
        #{rank}
      </span>
    );
  return (
    <span className="w-7 h-7 rounded-full bg-[#F1EFE8] text-[#5F5E5A] font-inter font-bold text-xs flex items-center justify-center shrink-0">
      #{rank}
    </span>
  );
}

const SCORE_INSIGHTS = [
  { label: "Avg. session gain", value: "+26 rank" },
  { label: "Weakest dimension", value: "Specificity" },
  { label: "Sessions to Top 25%", value: "~5 sessions" },
];

export function Features() {
  return (
    <section id="features" className="section-padding bg-white w-full">
      <SectionHeader
        chip="Features"
        title="Not just practice. Proof."
        subtitle="Every feature is built around one question: are you ready?"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12 max-w-6xl mx-auto items-stretch">
        <ScrollReveal direction="left" duration={0.7}>
          <HoverCard className="feat-card rounded-2xl p-6 sm:p-7 border border-[rgba(0,132,255,0.12)] bg-gradient-to-br from-[#EBF5FF] to-white h-full flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[rgba(0,132,255,0.1)] flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-blue" strokeWidth={1.8} />
            </div>
            <h3 className="font-fustat font-bold text-xl text-text mb-2">
              AI scoring on every answer
            </h3>
            <p className="font-inter text-[14px] text-muted leading-[1.6] mb-5">
              Rated across 4 dimensions with a reason and model answer — not a
              generic thumbs up.
            </p>
            <div className="space-y-3 flex-1">
              {FEATURE_DIMENSIONS.map((d, i) => (
                <AnimatedScoreBar
                  key={d.label}
                  label={d.label}
                  value={d.value}
                  delay={i * 0.08}
                />
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-[rgba(0,132,255,0.1)] grid grid-cols-1 gap-2">
              {SCORE_INSIGHTS.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-xs font-inter"
                >
                  <span className="text-muted">{item.label}</span>
                  <span className="font-semibold text-blue">{item.value}</span>
                </div>
              ))}
            </div>
          </HoverCard>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.08} duration={0.65}>
          <HoverCard className="feat-card rounded-2xl p-6 sm:p-7 bg-white border border-[rgba(0,0,0,0.08)] h-full flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[rgba(255,190,61,0.1)] flex items-center justify-center mb-4">
              <Trophy size={24} className="text-gold" strokeWidth={1.8} />
            </div>
            <h3 className="font-fustat font-bold text-xl text-text mb-2">
              Live peer benchmark
            </h3>
            <p className="font-inter text-[14px] text-muted leading-[1.6] mb-4">
              Compared to every candidate on the same role — you know your rank,
              not just your score.
            </p>
            <div className="space-y-2 flex-1">
              {MINI_LEADERBOARD.map((row) => (
                <div
                  key={row.rank}
                  className={cn(
                    "flex items-center gap-2.5 p-2 rounded-lg",
                    row.isYou && "bg-[rgba(0,132,255,0.06)]"
                  )}
                >
                  <RankBadge rank={row.rank} isYou={row.isYou} />
                  <span
                    className={cn(
                      "font-inter text-sm flex-1 min-w-0 truncate",
                      row.isYou ? "font-bold text-blue" : "text-text"
                    )}
                  >
                    {row.name}
                  </span>
                  <div className="w-14 h-1.5 rounded-full bg-[#EEF2F7] overflow-hidden shrink-0">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-light to-blue"
                      style={{ width: `${row.score}%` }}
                    />
                  </div>
                  <span className="font-inter font-semibold text-xs text-blue w-5 shrink-0">
                    {row.score}
                  </span>
                  {row.delta && (
                    <DeltaText size="xs" className="hidden sm:inline">
                      {row.delta}
                    </DeltaText>
                  )}
                </div>
              ))}
            </div>
          </HoverCard>
        </ScrollReveal>

        <ScrollReveal direction="right" delay={0.16} duration={0.65}>
          <HoverCard className="feat-card rounded-2xl p-6 sm:p-7 bg-white border border-[rgba(0,0,0,0.08)] h-full flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-[rgba(0,200,150,0.1)] flex items-center justify-center mb-4">
              <Share2 size={24} className="text-green" strokeWidth={1.8} />
            </div>
            <h3 className="font-fustat font-bold text-xl text-text mb-2">
              Share your rank
            </h3>
            <p className="font-inter text-[14px] text-muted leading-[1.6] mb-4">
              One tap for a public score card — built for LinkedIn and WhatsApp.
            </p>
            <div className="rounded-xl bg-navy p-4 flex items-center gap-3 flex-1">
                <OrbLogo size={40} />
              <div className="flex-1 min-w-0">
                <p className="font-inter text-sm text-white">
                  Rahul D. · SDE Fresher
                </p>
                <p className="font-inter text-xs text-[#60B1FF]">
                  Top 23% of 347 candidates
                </p>
              </div>
              <DeltaText size="xs" type="light">
                ↑ #26
              </DeltaText>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-inter text-muted">
              <Zap size={14} className="text-gold shrink-0" />
              <span>OG preview optimized for social shares</span>
            </div>
          </HoverCard>
        </ScrollReveal>
      </div>
    </section>
  );
}
