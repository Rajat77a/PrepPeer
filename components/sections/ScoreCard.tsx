import {
  BarChart3,
  Share2,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import HoverCard from "@/components/ui/HoverCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import AnimatedScoreBar from "@/components/ui/AnimatedScoreBar";
import { DeltaText } from "@/components/ui/DeltaText";
import { SCORECARD_BENEFITS, SESSION_REPORT } from "@/lib/mockData";
import Link from "next/link";

const iconMap: Record<string, LucideIcon> = {
  BarChart3,
  TrendingUp,
  Share2,
};

export function ScoreCardSection() {
  const report = SESSION_REPORT;

  return (
    <section id="scorecard" className="section-padding bg-white w-full">
      <SectionHeader
        chip="Session Results"
        title="Every session ends with proof."
        subtitle="A score card you can share. A weakness report you can act on."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mt-16 max-w-6xl mx-auto">
        <ScrollReveal direction="left" duration={0.75}>
          <HoverCard className="scorecard-mock rounded-3xl overflow-hidden border border-[rgba(0,132,255,0.15)] shadow-[0_32px_80px_rgba(0,0,0,0.08)] bg-white">
            <div
              className="px-7 pt-7 pb-9"
              style={{
                background: "linear-gradient(135deg, #1B2B5E 0%, #2255A4 100%)",
              }}
            >
              <p className="font-inter text-[13px] text-white/60 mb-1.5">
                {report.role} · {report.companyType}
              </p>
              <h3 className="font-fustat font-extrabold text-[22px] text-white mb-5">
                {report.name}
              </h3>
              <div className="flex items-center gap-5">
                <div
                  className="relative w-[88px] h-[88px] rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: `conic-gradient(#60B1FF 0%, #0084FF ${report.compositeScore}%, rgba(255,255,255,0.15) ${report.compositeScore}%)`,
                    boxShadow: "0 0 0 3px rgba(255,255,255,0.2)",
                  }}
                >
                  <div className="w-[70px] h-[70px] rounded-full bg-navy flex flex-col items-center justify-center">
                    <span className="font-fustat font-extrabold text-[22px] text-white leading-none">
                      {report.compositeScore}
                    </span>
                    <span className="font-inter text-[10px] text-white/50">
                      /100
                    </span>
                  </div>
                </div>
                <div>
                  <p className="font-fustat font-extrabold text-[28px] text-white">
                    {report.percentile}
                  </p>
                  <p className="font-inter text-[13px] text-white/65">
                    of {report.totalCandidates} SDE freshers
                  </p>
                  <p className="mt-2">
                    <DeltaText size="xs" type="light">
                      {report.rankDelta}
                    </DeltaText>
                  </p>
                </div>
              </div>
            </div>
            <div className="px-7 py-6 space-y-4">
              {report.dimensions.map((d, i) => (
                <AnimatedScoreBar
                  key={d.label}
                  label={d.label}
                  value={d.value}
                  color={d.color}
                  labelWidth="130px"
                  barHeight={7}
                  delay={i * 0.08}
                />
              ))}
              <div className="flex gap-2.5 pt-2">
                <Link
                  href="/login?next=%2Finterview%3Fmode%3Daccount"
                  className="flex-1 text-center py-2.5 rounded-[10px] bg-blue text-white font-inter font-semibold text-[13px] hover:scale-[1.02] transition-transform cursor-pointer"
                >
                  Practice Again
                </Link>
                <button
                  type="button"
                  className="flex-1 py-2.5 rounded-[10px] border border-[rgba(0,0,0,0.08)] font-inter font-semibold text-[13px] hover:scale-[1.02] transition-transform cursor-pointer"
                >
                  Share Score
                </button>
              </div>
            </div>
          </HoverCard>
        </ScrollReveal>

        <div className="space-y-8">
          {SCORECARD_BENEFITS.map((benefit, i) => {
            const Icon = iconMap[benefit.icon] ?? BarChart3;
            return (
              <ScrollReveal
                key={benefit.title}
                direction="right"
                delay={i * 0.1}
                duration={0.65}
              >
                <div className="flex gap-4 items-start">
                  <div className="w-11 h-11 rounded-xl bg-[rgba(0,132,255,0.1)] flex items-center justify-center shrink-0">
                    <Icon size={22} className="text-blue" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h4 className="font-fustat font-bold text-[17px] text-text mb-2">
                      {benefit.title}
                    </h4>
                    <p className="font-inter text-[15px] text-muted leading-[1.6]">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
