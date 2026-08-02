import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          DEFAULT: "#0084FF",
          glow: "rgba(0, 132, 255, 0.8)",
          light: "#60B1FF",
          mid: "#319AFF",
        },
        green: "#00C896",
        coral: "#FF6B3D",
        gold: "#FFBE3D",
        navy: "#1B2B5E",
        "off-white": "#F8F9FC",
        text: "#0A0A0F",
        muted: "#6B7280",
        star: "#FF801E",
      },
      fontFamily: {
        fustat: ["var(--font-fustat)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "16px",
      },
      boxShadow: {
        glass: "inset 0px 4px 4px 0px rgba(255,255,255,0.25), 0 8px 32px rgba(0,132,255,0.08)",
        "glass-sm": "inset 0px 2px 4px rgba(255,255,255,0.6)",
        "cta-primary":
          "inset 0px 4px 4px 0px rgba(255,255,255,0.35), 0 8px 24px rgba(0,132,255,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
