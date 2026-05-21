import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Session Results",
  description: "Your score card, weakness report, and per-question breakdown.",
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
