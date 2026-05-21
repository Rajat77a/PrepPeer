"use client";

const SPARKLES = [
  { top: "18%", left: "12%", delay: 0, size: 3 },
  { top: "62%", left: "8%", delay: 0.4, size: 2 },
  { top: "28%", left: "88%", delay: 0.8, size: 4 },
  { top: "72%", left: "92%", delay: 1.2, size: 2 },
  { top: "42%", left: "48%", delay: 0.6, size: 2 },
  { top: "12%", left: "55%", delay: 1.5, size: 3 },
  { top: "78%", left: "38%", delay: 0.2, size: 2 },
  { top: "35%", left: "72%", delay: 1.1, size: 3 },
];

export function NavSparkles() {
  return (
    <div
      className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
      aria-hidden
    >
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className="nav-sparkle absolute rounded-full"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      <span className="nav-shimmer absolute inset-0 rounded-full" />
    </div>
  );
}
