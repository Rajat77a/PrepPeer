/** Shared easing & viewport for Framer Motion */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** One-shot reveal — stable with Lenis; avoids edge flicker on scroll stop */
export const ONCE_VIEWPORT = {
  once: true as const,
  amount: 0.2,
};

/** Re-run enter animations every time the element scrolls into view */
export const REPEAT_VIEWPORT = {
  once: false as const,
  amount: 0.15,
  margin: "0px 0px -60px 0px",
};
