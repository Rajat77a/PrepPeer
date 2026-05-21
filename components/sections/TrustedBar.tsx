"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import { TRUSTED_LOGOS } from "@/lib/mockData";

const ICON_COLORS = [
  "#0084FF",
  "#00C896",
  "#FFBE3D",
  "#FF6B3D",
  "#319AFF",
];

export function TrustedBar() {
  return (
    <section className="bg-white py-12 px-6 border-b border-[rgba(0,0,0,0.04)]">
      <ScrollReveal direction="up" duration={0.6}>
        <p className="font-inter text-sm text-muted text-center mb-8">
          Trusted by Top-tier placement colleges
        </p>
      </ScrollReveal>
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 max-w-5xl mx-auto">
        {TRUSTED_LOGOS.map((logo, i) => (
          <ScrollReveal key={logo.name} direction="up" delay={i * 0.08}>
            <div className="flex items-center gap-2.5 opacity-40 grayscale hover:opacity-70 hover:grayscale-0 transition-all duration-300 cursor-default">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center font-fustat font-bold text-sm text-white shrink-0"
                style={{ backgroundColor: ICON_COLORS[i % ICON_COLORS.length] }}
              >
                {logo.icon}
              </div>
              <span className="font-fustat font-bold text-[17px] tracking-[-0.5px] text-text">
                {logo.name}
              </span>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
