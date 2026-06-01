import ScrollReveal from "@/components/ui/ScrollReveal";
import HoverCard from "@/components/ui/HoverCard";
import CountUp from "@/components/ui/CountUp";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";
import { LEADERBOARD_PREVIEW, LEADERBOARD_STATS } from "@/lib/mockData";

export function LeaderboardSection() {
  return (
    <section id="leaderboard-preview" className="section-padding bg-off-white w-full">
      <SectionHeader
        chip="Leaderboard"
        title="Where do you actually stand?"
        subtitle="The leaderboard updates in real time. Every session you take moves your rank."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mt-16 max-w-6xl mx-auto">
        <ScrollReveal direction="left" duration={0.8}>
          <HoverCard className="leaderboard-mock group rounded-3xl overflow-hidden border border-[rgba(0,132,255,0.15)] shadow-[0_32px_80px_rgba(0,132,255,0.1)] bg-white">
            <div className="relative overflow-hidden bg-navy px-6 py-5">
              <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-blue/30 to-transparent transition-transform duration-500 group-hover:translate-x-8" />
              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <p className="font-inter text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                    Live board preview
                  </p>
                  <span className="font-fustat font-bold text-base text-white">
                    Software Engineering - Fresher
                  </span>
                </div>
                <span className="font-inter text-xs font-semibold text-white/65">
                  This week
                </span>
              </div>
            </div>
            {LEADERBOARD_PREVIEW.map((entry) => (
              <LeaderboardRow key={entry.rank} entry={entry} compact />
            ))}
          </HoverCard>
        </ScrollReveal>

        <ScrollReveal direction="right" delay={0.15} duration={0.8}>
          <p className="font-fustat font-extrabold text-5xl tracking-[-2px] text-blue mb-3">
            <CountUp target={12400} suffix="+" />
          </p>
          <p className="font-inter text-[15px] text-muted leading-normal mb-8">
            interviews benchmarked this month across all roles
          </p>
          <div className="grid grid-cols-2 gap-5">
            {LEADERBOARD_STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-5 text-center"
              >
                <p className="font-fustat font-extrabold text-2xl text-text mb-1">
                  {stat.value}
                </p>
                <p className="font-inter text-[13px] text-muted leading-snug">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
