"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SCORE_TREND } from "@/lib/mockData";

export function ScoreTrendChart() {
  return (
    <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-6">
      <h3 className="font-fustat font-bold text-lg text-text mb-4">
        Score trend
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={SCORE_TREND}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
          <XAxis
            dataKey="session"
            tick={{ fontSize: 12, fill: "#6B7280", fontFamily: "var(--font-inter)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[40, 80]}
            tick={{ fontSize: 12, fill: "#6B7280", fontFamily: "var(--font-inter)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.08)",
              fontFamily: "var(--font-inter)",
              fontSize: 13,
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#0084FF"
            strokeWidth={2.5}
            dot={{ fill: "#0084FF", r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
