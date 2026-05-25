"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

type Plan = {
  id: "free" | "pro" | "college";
  label: string;
  price: string;
  description: string;
  cta: string;
  href: string;
  bg: string;
  accent: string;
  features: string[];
  popular?: boolean;
};

const TRANSITION = {
  duration: 0.45,
  ease: "backInOut" as const,
};

const plans: Plan[] = [
  {
    id: "free",
    label: "Free",
    price: "₹0",
    description: "3 mock interviews every month. Know where you stand, no card needed.",
    cta: "Start Free",
    href: "/interview",
    bg: "bg-[#0F172A]",
    accent: "#0F172A",
    features: [
      "3 full mock interviews every month",
      "5 questions per session with timed flow",
      "Scores on Clarity, Structure, Confidence & Depth",
      "Live rank vs peers on the leaderboard",
      "Session recap — what to fix next",
      "Upgrade anytime, history stays saved",
    ],
  },
  {
    id: "pro",
    label: "Pro",
    price: "₹299",
    description: "Unlimited mocks, curated questions, weakness heatmap and rank tracking.",
    cta: "Get Pro →",
    href: "/interview",
    bg: "bg-[#4F46E5]",
    accent: "#4F46E5",
    popular: true,
    features: [
      "Unlimited mocks — practice until you're ready",
      "10 questions per session + model answers",
      "Weakness heatmap by question type",
      "Week-over-week rank delta tracking",
      "Shareable score card for LinkedIn & recruiters",
      "Priority AI feedback (faster turnaround)",
      "Early access to new company interview packs",
    ],
  },
  {
    id: "college",
    label: "College",
    price: "Custom",
    description: "Placement cells use this to see who's actually interview-ready.",
    cta: "Contact Us",
    href: "/contact",
    bg: "bg-[#1E3A5F]",
    accent: "#1E3A5F",
    features: [
      "Everything in Pro for every enrolled student",
      "Batch readiness dashboard for TPOs",
      "Bulk onboarding via college email domain",
      "Export shortlists ranked by interview score",
      "Custom packs: Amazon, Deloitte, consulting",
      "Dedicated onboarding call for your team",
    ],
  },
];

export default function SquishyPricing() {
  return (
    <section id="pricing" className="section-padding w-full bg-[#f4f7fc]">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-14 text-center">
          <p className="mb-3 font-inter text-xs font-bold uppercase tracking-[0.14em] text-blue">
            Pricing
          </p>
          <h2 className="font-fustat text-[clamp(36px,4vw,54px)] font-extrabold leading-[1.08] tracking-[-1.5px] text-text">
            Pick what fits your prep.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-inter text-base leading-relaxed text-muted">
            All plans side by side — compare and choose in one glance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <PricingColumn key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingColumn({ plan }: { plan: Plan }) {
  const [expanded, setExpanded] = useState(plan.id === "pro");

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 h-7">
        {plan.popular && (
          <span className="rounded-full bg-[#4F46E5] px-4 py-1.5 text-xs font-bold text-white shadow-[0_12px_28px_rgba(79,70,229,0.35)]">
            Most popular
          </span>
        )}
      </div>

      <motion.article
        className={`relative flex h-[520px] w-full max-w-[400px] flex-col overflow-hidden rounded-[34px] p-8 text-white shadow-[0_28px_90px_rgba(15,23,42,0.25)] ${plan.bg}`}
        initial="rest"
        animate="rest"
        whileHover="hover"
        variants={{
          rest: { scale: 1 },
          hover: { scale: 1.035 },
        }}
        transition={TRANSITION}
      >
        {plan.id === "free" && <BGComponent1 />}
        {plan.id === "pro" && <BGComponent2 />}
        {plan.id === "college" && <BGComponent3 />}

        <div className="relative z-10 flex h-full flex-col">
          <span className="w-fit rounded-full bg-white/16 px-4 py-2 text-sm font-bold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)]">
            {plan.label}
          </span>

          <motion.div
            className="mt-10"
            variants={{
              rest: { scale: 1 },
              hover: { scale: 1.075 },
            }}
            transition={TRANSITION}
          >
            <p className="font-fustat text-[clamp(56px,5vw,78px)] font-extrabold leading-none tracking-[-3px] text-white">
              {plan.price}
            </p>
            <p className="mt-4 font-inter text-2xl font-extrabold text-white/72">/Month</p>
          </motion.div>

          <p className="mt-9 max-w-[310px] font-inter text-[18px] font-medium leading-[1.55] text-white/90">
            {plan.description}
          </p>

          <motion.div
            className="mt-auto"
            whileTap={{ scale: 0.965 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
          >
            <Link
              href={plan.href}
              className="block rounded-[22px] border-2 border-white bg-white px-5 py-5 text-center font-inter text-lg font-extrabold text-[#0F172A] shadow-[0_16px_40px_rgba(15,23,42,0.2)] transition-all duration-300 ease-out hover:scale-[1.015] hover:bg-white/10 hover:text-white hover:shadow-[0_18px_46px_rgba(255,255,255,0.14)]"
            >
              {plan.cta}
            </Link>
          </motion.div>
        </div>
      </motion.article>

      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="mt-4 font-inter text-base font-extrabold text-[#475569] transition-colors hover:text-[#4F46E5]"
      >
        {expanded ? "Hide features ↑" : "See what's included ↓"}
      </button>

      <div className="w-full max-w-[400px]">
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <ul className="mt-4 space-y-3 rounded-[26px] border border-slate-200 bg-white p-5 font-inter text-sm font-bold leading-snug text-slate-800 shadow-[0_18px_52px_rgba(15,23,42,0.1)]">
                {plan.features.map((feature, index) => (
                  <li key={feature} className="flex items-start gap-3">
                    <FeatureBullet color={plan.accent} index={index} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FeatureBullet({ color, index }: { color: string; index: number }) {
  const shapes = ["rounded-full", "rounded-[7px] rotate-45", "rounded-[9px]"];
  return (
    <span
      className={`relative mt-0.5 grid h-5 w-5 shrink-0 place-items-center shadow-[0_8px_18px_rgba(15,23,42,0.16)] ${shapes[index % shapes.length]}`}
      style={{ backgroundColor: color }}
    >
      <span className={`absolute h-2 w-2 bg-white/25 ${shapes[(index + 1) % shapes.length]}`} />
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className={`relative h-3.5 w-3.5 text-white ${index % shapes.length === 1 ? "-rotate-45" : ""}`}
        fill="none"
      >
        <path
          d="M3.25 8.25L6.25 11.25L12.75 4.75"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.4"
        />
      </svg>
    </span>
  );
}

function BGComponent1() {
  return (
    <motion.div className="absolute inset-0 opacity-45" aria-hidden>
      <motion.div
        className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full border border-white/30 bg-white/9"
        variants={{
          rest: { x: 0, y: 0, scale: 1, rotate: 0 },
          hover: { x: 78, y: -76, scale: 1.18, rotate: 14 },
        }}
        transition={TRANSITION}
      />
      <motion.div
        className="absolute -right-28 -top-24 h-72 w-72 rounded-full bg-white/18"
        variants={{
          rest: { x: 0, y: 0, scale: 1, rotate: 0 },
          hover: { x: -92, y: 94, scale: 1.22, rotate: -16 },
        }}
        transition={{ ...TRANSITION, delay: 0.04 }}
      />
      <motion.div
        className="absolute left-0 top-[46%] h-32 w-64 rounded-full bg-white/12"
        variants={{
          rest: { x: -150, y: 44, scale: 0.88, rotate: -18 },
          hover: { x: 52, y: -4, scale: 1.22, rotate: 6 },
        }}
        transition={{ ...TRANSITION, delay: 0.08 }}
      />
    </motion.div>
  );
}

function BGComponent2() {
  return (
    <motion.div className="absolute inset-0 opacity-55" aria-hidden>
      <motion.div
        className="absolute -right-24 top-24 h-64 w-64 rounded-[52px] border-2 border-[#C7D2FE]/70 bg-[#C7D2FE]/16"
        variants={{
          rest: { x: 0, y: 0, rotate: 78, scale: 1 },
          hover: { x: -92, y: 38, rotate: 76, scale: 1.2 },
        }}
        transition={TRANSITION}
      />
      <motion.div
        className="absolute -bottom-24 left-10 h-52 w-52 rounded-[44px] border-2 border-[#EEF2FF]/65 bg-[#EEF2FF]/14"
        variants={{
          rest: { x: -82, y: 36, rotate: 0, scale: 1 },
          hover: { x: 74, y: -86, rotate: 0, scale: 1.18 },
        }}
        transition={{ ...TRANSITION, delay: 0.04 }}
      />
      <motion.div
        className="absolute left-1/2 top-6 h-40 w-72 rounded-[40px] border-2 border-[#A5B4FC]/70 bg-[#A5B4FC]/14"
        variants={{
          rest: { x: -86, y: -80, rotate: 0, scale: 0.82 },
          hover: { x: -150, y: 24, rotate: 0, scale: 1.05 },
        }}
        transition={{ ...TRANSITION, delay: 0.08 }}
      />
    </motion.div>
  );
}

function BGComponent3() {
  return (
    <motion.div className="absolute inset-0 opacity-42" aria-hidden>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="absolute left-[62%] top-[64%] h-48 w-48 rotate-45 rounded-[36px] border border-white/20 bg-white/13"
          variants={{
            rest: { x: 70 - index * 34, y: 76 + index * 28, scale: 1 - index * 0.1 },
            hover: { x: -78 - index * 18, y: -126 - index * 18, scale: 1.16 - index * 0.06 },
          }}
          transition={{ ...TRANSITION, delay: index * 0.06 }}
        />
      ))}
      <motion.div
        className="absolute -right-20 top-16 h-60 w-60 rounded-full bg-white/12"
        variants={{
          rest: { x: 0, y: 0, scale: 1 },
          hover: { x: -104, y: 78, scale: 1.18 },
        }}
        transition={{ ...TRANSITION, delay: 0.05 }}
      />
    </motion.div>
  );
}
