"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { QuestionScore } from "@/lib/types";

interface QuestionBreakdownChartProps {
  data: QuestionScore[];
}

export function QuestionBreakdownChart({ data }: QuestionBreakdownChartProps) {
  return (
    <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-6 mt-6">
      <h3 className="font-fustat font-bold text-lg text-text mb-4">
        Per-question breakdown
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
          <XAxis
            dataKey="question"
            tick={{ fontSize: 12, fill: "#6B7280", fontFamily: "var(--font-inter)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "#6B7280", fontFamily: "var(--font-inter)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.08)",
              fontFamily: "var(--font-inter)",
            }}
          />
          <Bar dataKey="score" fill="#0084FF" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
