"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const testimonials = [
  {
    quote: "Cleared Flipkart after 6 sessions. PrepPeer found my weak spot in 10 minutes.",
    name: "Rahul S.",
    role: "B.Tech CSE, VIT",
    stat: "Specificity score was 4.2 — fixed in 2 weeks",
  },
  {
    quote: "Rank moved from #134 to #28. Got my Deloitte offer last month.",
    name: "Priya M.",
    role: "MBA Finance, NMIMS",
    stat: "Top 8% this week",
  },
  {
    quote: "Amazon L4 offer. PrepPeer told me my Confidence drops on behavioral questions.",
    name: "Arjun K.",
    role: "SDE, 2yr exp",
    stat: "↑ #41 → #1 SDE rank",
  },
  {
    quote: "I had no idea I was below average until PrepPeer showed me the leaderboard.",
    name: "Sneha R.",
    role: "Product Manager, BITS Pilani",
    stat: "Top 23% after 3 sessions",
  },
];

const transition = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1] as const,
};

export default function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = testimonials[activeIndex];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="testimonial-carousel">
      <div className="testimonial-carousel-inner">
        <p className="testimonial-carousel-kicker">Rank stories from PrepPeer students</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={transition}
          >
            <p className="testimonial-carousel-quote">“{active.quote}”</p>
            <div className="testimonial-carousel-meta">
              <p className="testimonial-carousel-name">{active.name}</p>
              <p className="testimonial-carousel-role">{active.role}</p>
              <p className="testimonial-carousel-stat">• {active.stat}</p>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="testimonial-carousel-dots">
          {testimonials.map((testimonial, index) => (
            <button
              aria-label={`Show testimonial from ${testimonial.name}`}
              className={index === activeIndex ? "active" : ""}
              key={testimonial.name}
              onClick={() => setActiveIndex(index)}
              type="button"
            />
          ))}
        </div>
      </div>
      <style>{`
        .testimonial-carousel {
          background: #F8F9FC;
          padding: 100px 48px;
          text-align: center;
        }

        .testimonial-carousel-inner {
          max-width: 760px;
          margin: 0 auto;
        }

        .testimonial-carousel-kicker {
          margin: 0 0 18px;
          font-size: 12px;
          color: #0084FF;
          letter-spacing: 0.12em;
          font-weight: 800;
        }

        .testimonial-carousel-quote {
          margin: 0;
          font-family: var(--font-fustat), sans-serif;
          font-weight: 700;
          font-size: clamp(22px, 3.5vw, 36px);
          color: #0A0A0F;
          letter-spacing: -0.5px;
          line-height: 1.3;
        }

        .testimonial-carousel-meta {
          margin-top: 28px;
        }

        .testimonial-carousel-name {
          margin: 0;
          font-weight: 600;
          font-size: 15px;
          color: #0A0A0F;
        }

        .testimonial-carousel-role {
          margin: 6px 0 0;
          font-size: 14px;
          color: #6B7280;
        }

        .testimonial-carousel-stat {
          margin: 12px 0 0;
          font-size: 12px;
          color: #0084FF;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 700;
        }

        .testimonial-carousel-dots {
          margin-top: 40px;
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .testimonial-carousel-dots button {
          width: 8px;
          height: 8px;
          border: 0;
          border-radius: 99px;
          background: #D1D5DB;
          padding: 0;
          transition: width 0.25s ease, background-color 0.25s ease;
          cursor: pointer;
        }

        .testimonial-carousel-dots button.active {
          width: 28px;
          background: #0084FF;
        }
      `}</style>
    </section>
  );
}
