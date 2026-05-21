import type { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { ScoreTrendChart } from "@/components/dashboard/ScoreTrendChart";
import { SessionHistory } from "@/components/dashboard/SessionHistory";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Track your interview sessions, scores, and rank improvement over time.",
};

const metrics = [
  { label: "Total sessions", value: "12" },
  { label: "Average score", value: "68/100" },
  { label: "Best percentile", value: "Top 18%" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="inner" />
      <div className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="font-fustat font-extrabold text-[clamp(32px,4vw,48px)] tracking-[-1.5px] text-text mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-5"
            >
              <p className="font-fustat font-extrabold text-[28px] text-text">
                {m.value}
              </p>
              <p className="font-inter text-[13px] text-muted mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        <ScoreTrendChart />
        <SessionHistory />
      </div>
    </div>
  );
}
