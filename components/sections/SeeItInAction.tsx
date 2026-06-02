"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useInView,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

const interviewTracks = [
  {
    label: "Behavioral - SDE Fresher",
    question:
      "Tell me about a time you disagreed with your manager. How did you handle it?",
    feedback:
      "Your answer demonstrated strong self-awareness but lacked specific outcome metrics. Consider using the STAR framework to...",
    scores: [
      { label: "Clarity", value: 72, className: "bg-[#006cff]" },
      { label: "Structure", value: 58, className: "bg-[#006cff]/70" },
      { label: "Confidence", value: 81, className: "bg-[#006cff]" },
      { label: "Depth", value: 64, className: "bg-[#006cff]/60" },
    ],
  },
  {
    label: "Product Sense - Product Manager",
    question:
      "How would you improve onboarding for users who drop off after signup?",
    feedback:
      "You found the right funnel area, but the answer needs sharper prioritization, experiment design, and a measurable success metric...",
    scores: [
      { label: "Clarity", value: 84, className: "bg-[#006cff]" },
      { label: "Structure", value: 76, className: "bg-[#006cff]/75" },
      { label: "Confidence", value: 68, className: "bg-[#006cff]/70" },
      { label: "Depth", value: 71, className: "bg-[#006cff]/60" },
    ],
  },
  {
    label: "Analytics - Data Analyst",
    question:
      "A key metric dropped 18% after launch. How would you investigate it?",
    feedback:
      "The investigation starts well, but it should separate tracking issues, cohort behavior, and product changes before recommending fixes...",
    scores: [
      { label: "Clarity", value: 79, className: "bg-[#006cff]/80" },
      { label: "Structure", value: 86, className: "bg-[#006cff]" },
      { label: "Confidence", value: 62, className: "bg-[#006cff]/65" },
      { label: "Depth", value: 74, className: "bg-[#006cff]/70" },
    ],
  },
  {
    label: "System Design - SDE 3-6 yrs",
    question:
      "Design a notification system for one million daily active users.",
    feedback:
      "The system covers the main services, but it needs clearer failure handling, rate limits, retries, and delivery guarantees...",
    scores: [
      { label: "Clarity", value: 69, className: "bg-[#006cff]/75" },
      { label: "Structure", value: 73, className: "bg-[#006cff]" },
      { label: "Confidence", value: 66, className: "bg-[#006cff]/65" },
      { label: "Depth", value: 82, className: "bg-[#006cff]" },
    ],
  },
  {
    label: "Operations - MBA",
    question:
      "A vendor delay affects 40% of orders. What would you do first?",
    feedback:
      "The response is decisive, but it should quantify customer impact, communicate tradeoffs, and define the first recovery checkpoint...",
    scores: [
      { label: "Clarity", value: 77, className: "bg-[#006cff]" },
      { label: "Structure", value: 70, className: "bg-[#006cff]/70" },
      { label: "Confidence", value: 88, className: "bg-[#006cff]" },
      { label: "Depth", value: 67, className: "bg-[#006cff]/60" },
    ],
  },
];

const tickerData = [
  "Arjun Sharma - NIT Trichy - #12 SDE Fresher",
  "Priya Nair - VIT Vellore - Top 8% Product Manager",
  "Rohit Verma - BITS Pilani - #3 SDE - 3-6 yrs",
  "Ananya Singh - IIT Bombay - improved 31 positions",
  "Karthik R - PSG Tech - #28 Operations",
  "Sneha Patel - Manipal - Top 15% MBA",
  "Aditya Kumar - NIT Warangal - #7 SDE Fresher",
  "Divya Menon - BITS Goa - improved 18 positions",
  "Rahul Gupta - SRM Chennai - #44 Product Manager",
  "Ishaan Mehta - IIT Delhi - Top 5% SDE - 1-3 yrs",
  "Lakshmi Rao - Amrita - #19 Consulting",
  "Vikram Nair - NIT Calicut - improved 52 positions",
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
  const cardControls = useAnimationControls();
  const [activeTrack, setActiveTrack] = useState(0);
  const track = interviewTracks[activeTrack];

  useEffect(() => {
    if (!inView) return;

    const interval = window.setInterval(() => {
      setActiveTrack((current) => (current + 1) % interviewTracks.length);
    }, 5600);

    return () => window.clearInterval(interval);
  }, [inView]);

  useEffect(() => {
    if (!inView) return;

    cardControls.start({
      rotateY: [-8, -17, -6, -8],
      rotateX: [2, 3.4, 1.4, 2],
      transition: {
        duration: 0.58,
        ease: [0.22, 1, 0.36, 1],
        times: [0, 0.38, 0.76, 1],
      },
    });
  }, [activeTrack, cardControls, inView]);

  return (
    <motion.article
      ref={ref}
      className="relative rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-8 shadow-[0_32px_90px_rgba(0,108,255,0.18)]"
      initial={{ opacity: 0, y: 34, rotateY: -8, rotateX: 2 }}
      whileInView={{ opacity: 1, y: 0, rotateY: -8, rotateX: 2 }}
      animate={cardControls}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 1000 }}
      whileHover={{
        rotateY: 0,
        rotateX: 0,
        transition: { duration: 0.4, ease: "easeOut" },
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`question-${activeTrack}`}
          initial={{ opacity: 0, x: 28, filter: "blur(8px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: -24, filter: "blur(8px)" }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-inter text-xs font-medium text-white/30">
            {track.label}
          </p>
          <h3 className="mt-5 min-h-[96px] font-inter text-lg font-medium leading-8 text-white">
            {track.question}
          </h3>
        </motion.div>
      </AnimatePresence>

      <div className="my-7 h-px bg-white/[0.08]" />

      <div className="space-y-5">
        {track.scores.map((score, index) => (
          <div key={score.label}>
            <div className="mb-2 flex items-center justify-between font-inter text-xs">
              <span className="text-white/48">{score.label}</span>
              <span className="text-white/36">{score.value}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
              <motion.div
                key={`${activeTrack}-${score.label}`}
                className={`h-full rounded-full ${score.className}`}
                initial={{ width: 0 }}
                animate={{ width: inView ? `${score.value}%` : 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-8 select-none rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4"
        aria-hidden="true"
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={`feedback-${activeTrack}`}
            className="pointer-events-none blur-sm font-inter text-sm leading-6 text-white/50"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
          >
            {track.feedback}
          </motion.p>
        </AnimatePresence>
        <div className="pointer-events-none mt-4 flex items-center gap-2 font-inter text-xs text-white/30">
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
        className={`ticker-track flex w-max gap-10 py-3 ${
          direction === "left" ? "ticker-left" : "ticker-right"
        }`}
      >
        {[...items, ...items].map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="shrink-0 font-inter text-[15px] font-semibold tracking-[-0.01em] text-[#41516a] transition-colors duration-300 hover:text-[#07111f]"
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
      <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:items-start">
        <div>
          <p className="font-inter text-[clamp(52px,5.4vw,76px)] font-black leading-none tracking-[-0.065em] text-[#07111f]">
            {interviews.toLocaleString()}+
          </p>
          <p className="mt-4 font-inter text-sm font-semibold text-[#64748b]">
            interviews completed
          </p>
        </div>
        <div>
          <p className="font-inter text-[clamp(52px,5.4vw,76px)] font-black leading-none tracking-[-0.065em] text-[#07111f]">
            {colleges}+
          </p>
          <p className="mt-4 font-inter text-sm font-semibold text-[#64748b]">
            colleges represented
          </p>
        </div>
        <div>
          <p className="font-inter text-[clamp(52px,5.4vw,76px)] font-black leading-none tracking-[-0.065em] text-[#006cff]">
            Top {top}%
          </p>
          <p className="mt-4 font-inter text-sm font-semibold text-[#64748b]">
            performers get recruiter attention
          </p>
        </div>
      </div>

      <Link
        href="/login?next=%2Finterview%3Fmode%3Daccount"
        className="mt-12 inline-flex rounded-full bg-[#006cff] px-6 py-3 font-inter text-sm font-semibold text-white shadow-[0_14px_34px_rgba(0,108,255,0.24)] transition hover:bg-[#0057cc]"
      >
        See where you rank -&gt;
      </Link>
    </div>
  );
}

export function SeeItInAction() {
  const firstRow = tickerData.slice(0, 6);
  const secondRow = tickerData.slice(6);

  return (
    <section
      id="see-it-in-action"
      className="relative overflow-hidden bg-[#f7fbff] py-32"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(0,132,255,0.12),transparent_30%),radial-gradient(circle_at_84%_58%,rgba(96,177,255,0.14),transparent_34%),linear-gradient(180deg,#ffffff_0%,#eef7ff_52%,#ffffff_100%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-inter text-[clamp(20px,2vw,28px)] font-extrabold tracking-[-0.045em] text-[#006cff]">
              What a real interview looks like
            </p>
            <h2 className="mt-5 max-w-[640px] font-inter text-[clamp(52px,7vw,92px)] font-black leading-[0.92] tracking-[-0.07em] text-[#07111f]">
              Answer. Get scored. Know your rank.
            </h2>
            <p className="mt-6 max-w-[520px] font-inter text-lg font-medium leading-8 text-[#64748b]">
              Every answer is evaluated on Clarity, Structure, Confidence and
              Depth - not just keywords.
            </p>
          </motion.div>

          <ScoreCard />
        </div>

        <div className="mt-32">
          <p className="mb-8 max-w-[760px] font-inter text-[clamp(42px,5.4vw,76px)] font-black leading-[0.92] tracking-[-0.07em] text-[#07111f]">
            Happening right now
          </p>
          <div className="-mx-6 space-y-2 md:-mx-10">
            <TickerRow direction="left" items={firstRow} />
            <TickerRow direction="right" items={secondRow} />
          </div>
        </div>

        <Stats />
      </div>

      <style jsx global>{`
        .ticker-mask {
          mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
        }

        .ticker-left {
          animation: ticker-left 30s linear infinite;
        }

        .ticker-right {
          animation: ticker-right 32s linear infinite;
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
