"use client";

import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import HoverCard from "@/components/ui/HoverCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { OrbLogo } from "@/components/ui/OrbLogo";
import AnimatedScoreBar from "@/components/ui/AnimatedScoreBar";
import { FEATURE_DIMENSIONS } from "@/lib/mockData";
import { DeltaText } from "@/components/ui/DeltaText";

const SCORE_INSIGHTS = [
  { label: "Avg. session gain", value: "+26 rank" },
  { label: "Weakest dimension", value: "Specificity" },
  { label: "Sessions to Top 25%", value: "~5 sessions" },
];

const RANK_MOVEMENT = [
  { label: "Start", rank: "#67", x: "8%", y: "72%" },
  { label: "After Q3", rank: "#52", x: "34%", y: "49%" },
  { label: "Final", rank: "#41", x: "68%", y: "22%" },
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
          <HoverCard className="group feat-card relative overflow-hidden rounded-2xl p-6 sm:p-7 border border-[rgba(0,132,255,0.12)] bg-gradient-to-br from-[#EBF5FF] to-white h-full flex flex-col">
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-blue to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="mb-5 flex items-center justify-between">
              <span className="font-fustat text-[13px] font-extrabold tracking-[0.18em] text-blue">
                01
              </span>
              <span className="h-px flex-1 mx-4 bg-[rgba(0,132,255,0.16)]" />
              <ArrowUpRight
                size={18}
                className="text-blue opacity-50 transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100"
              />
            </div>
            <h3 className="font-fustat font-bold text-xl text-text mb-2">
              Answer signal, not applause
            </h3>
            <p className="font-inter text-[14px] text-muted leading-[1.6] mb-5">
              Each answer is broken into the parts interviewers actually listen
              for: clarity, reasoning, detail, and confidence.
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
              {SCORE_INSIGHTS.map((item, index) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-xs font-inter transition-transform duration-300 group-hover:translate-x-1"
                  style={{ transitionDelay: `${index * 45}ms` }}
                >
                  <span className="text-muted">{item.label}</span>
                  <span className="font-semibold text-blue">{item.value}</span>
                </div>
              ))}
            </div>
          </HoverCard>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.08} duration={0.65}>
          <HoverCard className="group feat-card relative overflow-hidden rounded-2xl p-6 sm:p-7 bg-white border border-[rgba(0,0,0,0.08)] h-full flex flex-col">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,190,61,0.14),transparent_42%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative mb-5 flex items-center justify-between">
              <span className="font-fustat text-[13px] font-extrabold tracking-[0.18em] text-[#B77900]">
                02
              </span>
              <span className="h-px flex-1 mx-4 bg-[rgba(255,190,61,0.28)]" />
              <span className="font-inter text-[12px] font-bold text-[#B77900]">
                +26 places
              </span>
            </div>
            <h3 className="relative font-fustat font-bold text-xl text-text mb-2">
              Rank movement snapshot
            </h3>
            <p className="relative font-inter text-[14px] text-muted leading-[1.6] mb-4">
              A quick visual trail of how one session changes your position. The
              full leaderboard below stays reserved for the real ranked board.
            </p>
            <div className="relative mt-2 min-h-[190px] flex-1 overflow-hidden rounded-2xl border border-[rgba(0,0,0,0.06)] bg-[#FAFBFD] p-5">
              <div className="absolute left-8 right-8 top-[52%] h-px bg-gradient-to-r from-gold via-blue to-green" />
              {RANK_MOVEMENT.map((point, index) => (
                <motion.div
                  key={point.label}
                  className="absolute"
                  style={{ left: point.x, top: point.y }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.35, delay: index * 0.12 }}
                >
                  <div className="transition-transform duration-300 group-hover:-translate-y-1">
                    <p className="font-inter text-[11px] font-semibold text-muted">
                      {point.label}
                    </p>
                    <p className="font-fustat text-2xl font-extrabold text-text">
                      {point.rank}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div className="absolute bottom-5 left-5 right-5 rounded-xl bg-white/80 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
                <p className="font-inter text-xs font-semibold text-text">
                  Your rank jumps when answers become specific.
                </p>
              </div>
            </div>
          </HoverCard>
        </ScrollReveal>

        <ScrollReveal direction="right" delay={0.16} duration={0.65}>
          <HoverCard className="group feat-card relative overflow-hidden rounded-2xl p-6 sm:p-7 bg-white border border-[rgba(0,0,0,0.08)] h-full flex flex-col">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[rgba(0,200,150,0.12)] blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative mb-5 flex items-center justify-between">
              <span className="font-fustat text-[13px] font-extrabold tracking-[0.18em] text-green">
                03
              </span>
              <span className="h-px flex-1 mx-4 bg-[rgba(0,200,150,0.22)]" />
              <ArrowUpRight
                size={18}
                className="text-green opacity-50 transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100"
              />
            </div>
            <h3 className="relative font-fustat font-bold text-xl text-text mb-2">
              Shareable proof card
            </h3>
            <p className="relative font-inter text-[14px] text-muted leading-[1.6] mb-4">
              A clean public result card that says what changed, where you
              stand, and why the session mattered.
            </p>
            <div className="relative rounded-xl bg-navy p-4 flex items-center gap-3 flex-1 overflow-hidden">
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-blue/30 to-transparent opacity-70 transition-transform duration-500 group-hover:translate-x-4" />
              <OrbLogo size={40} />
              <div className="relative flex-1 min-w-0">
                <p className="font-inter text-sm text-white">
                  Rahul D. - SDE Fresher
                </p>
                <p className="font-inter text-xs text-[#60B1FF]">
                  Top 23% of 347 candidates
                </p>
              </div>
              <DeltaText size="xs" type="light">
                +26
              </DeltaText>
            </div>
            <div className="mt-4 border-t border-[rgba(0,0,0,0.07)] pt-4">
              <p className="font-inter text-xs font-semibold text-text">
                Designed to read clearly in a recruiter feed.
              </p>
              <p className="mt-1 font-inter text-xs leading-5 text-muted">
                Name, role, percentile, and rank gain stay visible without a
                noisy badge or caption.
              </p>
            </div>
          </HoverCard>
        </ScrollReveal>
      </div>
    </section>
  );
}
