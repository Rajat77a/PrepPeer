"use client";

import { useEffect, useState } from "react";

const words = [
  "Software Engineer.",
  "Data Scientist.",
  "Product Manager.",
  "Marketing Manager.",
  "Finance Analyst.",
  "Operations Manager.",
];

export default function TypingText() {
  const [wordIndex, setWordIndex] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    const isFullyTyped = characterCount === currentWord.length;
    const isFullyDeleted = characterCount === 0;
    const delay = isFullyTyped && !isDeleting ? 1800 : isDeleting ? 30 : 60;

    const timeout = window.setTimeout(() => {
      if (!isDeleting && isFullyTyped) {
        setIsDeleting(true);
        return;
      }

      if (isDeleting && isFullyDeleted) {
        setIsDeleting(false);
        setWordIndex((current) => (current + 1) % words.length);
        return;
      }

      setCharacterCount((current) => current + (isDeleting ? -1 : 1));
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [characterCount, isDeleting, wordIndex]);

  return (
    <span className="typing-text">
      <span className="typing-text-sizer">Operations Manager.</span>
      <span className="typing-text-value">
        {words[wordIndex].slice(0, characterCount) || "\u00A0"}
      </span>
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
          border-right: 2px solid #0084FF;
          animation: blink 1s step-end infinite;
        }

        @keyframes blink {
          0%, 100% { border-color: #0084FF; }
          50% { border-color: transparent; }
        }
      `}</style>
    </span>
  );
}
