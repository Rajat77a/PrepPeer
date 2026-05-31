"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const scores = [
  { label: "Clarity", value: 72, className: "bg-[#006cff]" },
  { label: "Structure", value: 58, className: "bg-[#006cff]/70" },
  { label: "Confidence", value: 81, className: "bg-[#006cff]" },
  { label: "Depth", value: 64, className: "bg-[#006cff]/60" },
];

const tickerData = [
  "Arjun Sharma · NIT Trichy · #12 SDE Fresher",
  "Priya Nair · VIT Vellore · Top 8% Product Manager",
  "Rohit Verma · BITS Pilani · #3 SDE · 3-6 yrs",
  "Ananya Singh · IIT Bombay · improved 31 positions",
  "Karthik R · PSG Tech · #28 Operations",
  "Sneha Patel · Manipal · Top 15% MBA",
  "Aditya Kumar · NIT Warangal · #7 SDE Fresher",
  "Divya Menon · BITS Goa · improved 18 positions",
  "Rahul Gupta · SRM Chennai · #44 Product Manager",
  "Ishaan Mehta · IIT Delhi · Top 5% SDE · 1-3 yrs",
  "Lakshmi Rao · Amrita · #19 Consulting",
  "Vikram Nair · NIT Calicut · improved 52 positions",
];

function useCountUp(target: number, start: boolean, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;

    let frame = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, start, target]);

  return value;
}

function ScoreCard() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <motion.article
      ref={ref}
      className="relative rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-8 shadow-[0_0_60px_rgba(0,108,255,0.08)]"
      initial={{ opacity: 0, y: 34, rotateY: -8, rotateX: 2 }}
      whileInView={{ opacity: 1, y: 0, rotateY: -8, rotateX: 2 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 1000 }}
      whileHover={{ rotateY: 0, rotateX: 0, transition: { duration: 0.4, ease: "easeOut" } }}
    >
      <p className="font-inter text-xs font-medium text-white/30">
        Behavioral · SDE Fresher
      </p>
      <h3 className="mt-5 font-inter text-lg font-medium leading-8 text-white">
        Tell me about a time you disagreed with your manager. How did you handle it?
      </h3>

      <div className="my-7 h-px bg-white/[0.08]" />

      <div className="space-y-5">
        {scores.map((score, index) => (
          <div key={score.label}>
            <div className="mb-2 flex items-center justify-between font-inter text-xs">
              <span className="text-white/48">{score.label}</span>
              <span className="text-white/36">{score.value}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
              <motion.div
                className={`h-full rounded-full ${score.className}`}
                initial={{ width: 0 }}
                animate={{ width: inView ? `${score.value}%` : 0 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
        <p className="blur-sm font-inter text-sm leading-6 text-white/50">
          Your answer demonstrated strong self-awareness but lacked specific outcome
          metrics. Consider using the STAR framework to...
        </p>
        <div className="mt-4 flex items-center gap-2 font-inter text-xs text-white/30">
          <Lock size={13} />
          Complete an interview to unlock your feedback
        </div>
      </div>
    </motion.article>
  );
}

function TickerRow({
  direction,
  items,
}: {
  direction: "left" | "right";
  items: string[];
}) {
  return (
    <div className="ticker-mask overflow-hidden">
      <div
        className={`ticker-track flex w-max gap-8 py-3 ${
          direction === "left" ? "ticker-left" : "ticker-right"
        }`}
      >
        {[...items, ...items].map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="shrink-0 font-inter text-sm text-white/50 transition-colors duration-300 hover:text-white"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function Stats() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const interviews = useCountUp(4800, inView);
  const colleges = useCountUp(130, inView);
  const top = useCountUp(10, inView);

  return (
    <div ref={ref} className="mt-24">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.5fr_1fr_1.2fr] md:items-end">
        <div>
          <p className="font-fustat text-6xl font-bold tracking-[-0.05em] text-white">
            {interviews.toLocaleString()}+
          </p>
          <p className="mt-3 font-inter text-sm text-white/40">interviews completed</p>
        </div>
        <div className="md:translate-y-4">
          <p className="font-fustat text-4xl font-bold tracking-[-0.04em] text-white">
            {colleges}+
          </p>
          <p className="mt-3 font-inter text-sm text-white/40">colleges represented</p>
        </div>
        <div className="md:-translate-y-3">
          <p className="font-fustat text-4xl font-bold tracking-[-0.04em] text-[#006cff]">
            Top {top}%
          </p>
          <p className="mt-3 font-inter text-sm text-white/40">
            performers get recruiter attention
          </p>
        </div>
      </div>

      <Link
        href="/interview"
        className="mt-12 inline-flex rounded-full bg-[#006cff] px-6 py-3 font-inter text-sm font-medium text-white transition hover:bg-[#0057cc]"
      >
        See where you rank →
      </Link>
    </div>
  );
}

export function SeeItInAction() {
  const firstRow = tickerData.slice(0, 6);
  const secondRow = tickerData.slice(6);

  return (
    <section id="pricing" className="bg-[#080808] py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-inter text-sm font-normal text-white/40">
              What a real interview looks like
            </p>
            <h2 className="mt-5 max-w-[640px] font-fustat text-[clamp(44px,6vw,76px)] font-extrabold leading-[0.96] tracking-[-0.055em] text-white">
              Answer. Get scored. Know your rank.
            </h2>
            <p className="mt-6 max-w-[520px] font-inter text-lg leading-8 text-white/48">
              Every answer is evaluated on Clarity, Structure, Confidence and Depth
              — not just keywords.
            </p>
          </motion.div>

          <ScoreCard />
        </div>

        <div className="mt-32">
          <p className="mb-6 font-inter text-sm font-normal text-white/40">
            Happening right now
          </p>
          <div className="space-y-2">
            <TickerRow direction="left" items={firstRow} />
            <TickerRow direction="right" items={secondRow} />
          </div>
        </div>

        <Stats />
      </div>

      <style jsx>{`
        .ticker-mask {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }

        .ticker-track:hover {
          animation-play-state: paused;
        }

        .ticker-left {
          animation: ticker-left 38s linear infinite;
        }

        .ticker-right {
          animation: ticker-right 42s linear infinite;
        }

        @keyframes ticker-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes ticker-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}
