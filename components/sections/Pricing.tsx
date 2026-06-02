"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import HoverCard from "@/components/ui/HoverCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { PRICING_PLANS } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const PRICING_DELAYS = [0, 0.15, 0.08];

export function Pricing() {
  return (
    <section id="pricing" className="section-padding bg-[#f4f7fc] w-full">
      <SectionHeader
        chip="Pricing"
        title="Pick what fits your prep."
        subtitle="All plans side by side — compare and choose in one glance."
      />

      <div className="flex flex-row flex-nowrap gap-5 sm:gap-6 mt-14 max-w-6xl mx-auto overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none md:grid md:grid-cols-3 md:overflow-visible md:pb-0 items-stretch">
        {PRICING_PLANS.map((plan, i) => (
          <ScrollReveal
            key={plan.id}
            direction="up"
            delay={PRICING_DELAYS[i]}
            duration={0.7}
            className="snap-center shrink-0 w-[min(300px,82vw)] md:w-auto md:shrink h-full"
          >
            <HoverCard
              className={cn(
                "pricing-card relative rounded-3xl p-8 border h-full flex flex-col",
                plan.featured
                  ? "bg-navy border-transparent shadow-[0_32px_80px_rgba(27,43,94,0.35)] md:scale-[1.04] z-10"
                  : "bg-white border-[rgba(0,0,0,0.08)] shadow-[0_12px_40px_rgba(0,0,0,0.04)]"
              )}
            >
              {plan.featured && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue text-white font-inter font-bold text-xs px-4 py-1 rounded-full flex items-center gap-1.5 shadow-[0_4px_16px_rgba(0,132,255,0.45)]">
                  <Sparkles size={12} />
                  Most popular
                </span>
              )}

              <h3
                className={cn(
                  "font-fustat font-bold text-xl mb-1",
                  plan.featured ? "text-white" : "text-text"
                )}
              >
                {plan.name}
              </h3>
              {plan.tagline && (
                <p
                  className={cn(
                    "font-inter text-sm mb-4 leading-snug",
                    plan.featured ? "!text-[rgba(255,255,255,0.7)]" : "text-muted"
                  )}
                >
                  {plan.tagline}
                </p>
              )}

              <div className="flex items-baseline gap-1 mb-1">
                <span
                  className={cn(
                    "font-fustat font-extrabold text-[40px] tracking-[-2px]",
                    plan.featured ? "text-white" : "text-text"
                  )}
                >
                  {plan.price}
                </span>
                {plan.id === "pro" && (
                  <span
                    className={cn(
                      "font-inter font-medium text-base",
                      plan.featured ? "text-white/50" : "text-muted"
                    )}
                  >
                    /mo
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "font-inter text-xs mb-6",
                  plan.featured ? "text-white/45" : "text-muted"
                )}
              >
                {plan.period}
              </p>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check
                      size={17}
                      className={cn(
                        "shrink-0 mt-0.5",
                        plan.featured ? "text-[#60B1FF]" : "text-green"
                      )}
                      strokeWidth={2.5}
                    />
                    <span
                      className={cn(
                        "font-inter text-[14px] leading-snug",
                        plan.featured
                          ? "!text-[rgba(255,255,255,0.95)]"
                          : "text-[#374151]"
                      )}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.featured ? (
                <Button
                  href="/login?next=%2Finterview%3Fmode%3Daccount"
                  className="w-full justify-center !bg-blue !text-white shadow-[0_8px_24px_rgba(0,132,255,0.4)]"
                >
                  {plan.cta}
                </Button>
              ) : (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="w-full py-3.5 rounded-xl font-inter font-semibold text-[15px] bg-[rgba(0,132,255,0.08)] text-blue cursor-pointer transform-gpu"
                  style={{ willChange: "transform" }}
                >
                  {plan.cta}
                </motion.button>
              )}
            </HoverCard>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
