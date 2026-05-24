"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const words = [
  "Software Engineer",
  "Data Scientist",
  "Product Manager",
  "Marketing Manager",
  "Finance Analyst",
  "Operations Manager",
];

export default function TypingText() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setWordIndex((current) => (current + 1) % words.length);
    }, 2500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <span className="typing-text">
      <span className="typing-text-sizer">Operations Manager</span>
      <AnimatePresence mode="wait">
        <motion.span
          animate={{ opacity: 1, y: 0 }}
          className="typing-text-value"
          exit={{ opacity: 0, y: -18 }}
          initial={{ opacity: 0, y: 18 }}
          key={words[wordIndex]}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {words[wordIndex]}
        </motion.span>
      </AnimatePresence>
      <style>{`
        .typing-text {
          position: relative;
          display: block;
          min-height: 1.08em;
          line-height: 1.05;
          color: #0084FF;
          white-space: nowrap;
          overflow: hidden;
        }

        .typing-text-sizer {
          display: block;
          visibility: hidden;
        }

        .typing-text-value {
          position: absolute;
          left: 0;
          top: 0;
          color: #0084FF;
        }
      `}</style>
    </span>
  );
}
