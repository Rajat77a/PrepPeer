import type { Metadata } from "next";
import { LeaderboardClient } from "@/components/dashboard/LeaderboardClient";

export const metadata: Metadata = {
  title: "Leaderboard",
};

export default function DashboardLeaderboardPage() {
  return <LeaderboardClient />;
}
