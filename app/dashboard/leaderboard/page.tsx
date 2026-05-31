import type { Metadata } from "next";
import { cookies } from "next/headers";
import { LeaderboardClient } from "@/components/dashboard/LeaderboardClient";
import {
  toLeaderboardEntries,
  type InterviewSessionRow,
} from "@/lib/ranking";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/utils/supabase/user";

export const metadata: Metadata = {
  title: "Leaderboard",
};

export default async function DashboardLeaderboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const user = await getCurrentUser();

  const { data: rows } = await supabase
    .from("interview_sessions")
    .select(
      "id,user_id,role,experience,company_type,composite_score,dimensions,question_scores,summary,created_at"
    )
    .order("created_at", { ascending: false })
    .limit(1000);

  const entries = toLeaderboardEntries(
    (rows ?? []) as InterviewSessionRow[],
    user?.id,
    String(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "You"),
    String(user?.user_metadata?.college ?? "")
  );

  return <LeaderboardClient entries={entries} />;
}
