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
  featurePanel: string;
  featureText: string;
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
    featurePanel: "bg-white border-[#CBD5E1]",
    featureText: "text-[#0F172A]",
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
    featurePanel: "bg-[#EEF2FF] border-[#C7D2FE]",
    featureText: "text-[#312E81]",
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
    featurePanel: "bg-white border-[#CBD5E1]",
    featureText: "text-[#1E3A5F]",
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
    <section id="pricing" className="section-padding bg-[#f4f7fc] w-full">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
      <div className="mb-3 h-6">
        {plan.popular && (
          <span className="rounded-full bg-[#4F46E5] px-3 py-1 text-xs font-bold text-white">
            Most popular
          </span>
        )}
      </div>

      <motion.article
        className={`relative flex h-[430px] w-full max-w-[360px] flex-col overflow-hidden rounded-[28px] p-7 text-white shadow-[0_22px_70px_rgba(15,23,42,0.22)] ${plan.bg}`}
        initial="rest"
        whileHover="hover"
        animate="rest"
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
          <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">
            {plan.label}
          </span>

          <motion.div
            className="mt-8"
            variants={{
              rest: { scale: 1 },
              hover: { scale: 1.06 },
            }}
            transition={TRANSITION}
          >
            <p className="font-fustat text-[52px] font-extrabold leading-none tracking-[-2px] text-white">
              {plan.price}
            </p>
            <p className="mt-2 font-inter text-sm font-semibold text-white/70">/Month</p>
          </motion.div>

          <p className="mt-7 font-inter text-[15px] leading-relaxed text-white/78">
            {plan.description}
          </p>

          <Link
            href={plan.href}
            className="mt-auto block rounded-2xl bg-white px-5 py-3.5 text-center font-inter text-sm font-bold text-[#0F172A] shadow-[0_14px_34px_rgba(15,23,42,0.18)] transition-transform hover:scale-[1.02]"
          >
            {plan.cta}
          </Link>
        </div>
      </motion.article>

      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="mt-4 font-inter text-sm font-bold text-[#475569] transition-colors hover:text-[#4F46E5]"
      >
        {expanded ? "Hide features ↑" : "See what's included ↓"}
      </button>

      <div className="w-full max-w-[360px]">
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <ul
                className={`mt-4 space-y-3 rounded-3xl border p-5 font-inter text-sm font-semibold leading-snug shadow-[0_18px_48px_rgba(15,23,42,0.08)] ${plan.featurePanel} ${plan.featureText}`}
              >
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckIcon color={plan.accent} />
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

function CheckIcon({ color }: { color: string }) {
  return (
    <span
      className="mt-0.5 grid h-5 w-5 shrink-0 rotate-45 place-items-center rounded-[7px] shadow-[0_8px_18px_rgba(15,23,42,0.16)]"
      style={{ backgroundColor: color }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="h-3.5 w-3.5 -rotate-45 text-white"
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
        className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/18"
        variants={{
          rest: { x: 0, y: 0, scale: 1, rotate: 0 },
          hover: { x: -72, y: 84, scale: 1.22, rotate: 18 },
        }}
        transition={TRANSITION}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full border border-white/35 bg-white/10"
        variants={{
          rest: { x: 0, y: 0, scale: 1, rotate: -12 },
          hover: { x: 78, y: -74, scale: 1.12, rotate: 12 },
        }}
        transition={{ ...TRANSITION, delay: 0.06 }}
      />
      <motion.div
        className="absolute left-8 top-36 h-28 w-44 rounded-full bg-white/12 blur-[1px]"
        variants={{
          rest: { x: -36, y: 24, scale: 0.9, rotate: -16 },
          hover: { x: 56, y: 8, scale: 1.18, rotate: 6 },
        }}
        transition={{ ...TRANSITION, delay: 0.1 }}
      />
    </motion.div>
  );
}

function BGComponent2() {
  return (
    <motion.div className="absolute inset-0 opacity-35" aria-hidden>
      <motion.div
        className="absolute -right-20 top-10 h-44 w-44 rounded-[38px] bg-white/20"
        variants={{
          rest: { x: 0, y: 0, rotate: 16, scale: 1 },
          hover: { x: -88, y: 70, rotate: -14, scale: 1.18 },
        }}
        transition={TRANSITION}
      />
      <motion.div
        className="absolute -bottom-16 -left-16 h-44 w-44 rounded-[38px] bg-white/16"
        variants={{
          rest: { x: 0, y: 0, rotate: -18, scale: 1 },
          hover: { x: 92, y: -78, rotate: 15, scale: 1.12 },
        }}
        transition={{ ...TRANSITION, delay: 0.04 }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-28 w-56 rounded-[32px] bg-white/14"
        variants={{
          rest: { x: -140, y: -120, rotate: 28, scale: 0.85 },
          hover: { x: -112, y: -44, rotate: -4, scale: 1.08 },
        }}
        transition={{ ...TRANSITION, delay: 0.08 }}
      />
    </motion.div>
  );
}

function BGComponent3() {
  return (
    <motion.div className="absolute inset-0 opacity-40" aria-hidden>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="absolute left-1/2 top-[66%] h-40 w-40 -translate-x-1/2 rotate-45 rounded-[30px] border border-white/20 bg-white/14"
          variants={{
            rest: { x: 92 - index * 42, y: 80 + index * 26, scale: 1 - index * 0.12 },
            hover: { x: 14 - index * 14, y: -90 - index * 18, scale: 1.16 - index * 0.08 },
          }}
          transition={{ ...TRANSITION, delay: index * 0.06 }}
        />
      ))}
      <motion.div
        className="absolute -right-16 top-12 h-48 w-48 rounded-full bg-white/12"
        variants={{
          rest: { x: 0, y: 0, scale: 1 },
          hover: { x: -86, y: 84, scale: 1.18 },
        }}
        transition={{ ...TRANSITION, delay: 0.05 }}
      />
    </motion.div>
  );
}
