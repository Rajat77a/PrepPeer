import type { Metadata } from "next";
import { cookies } from "next/headers";
import { LeaderboardClient } from "@/components/dashboard/LeaderboardClient";
import {
  toLiveLeaderboardEntries,
  type SupabaseLeaderboardRow,
} from "@/lib/liveLeaderboard";
import { createOptionalAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/utils/supabase/user";

export const metadata: Metadata = {
  title: "Leaderboard",
};

export default async function DashboardLeaderboardPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const leaderboardSupabase = createOptionalAdminClient() ?? supabase;
  const user = await getCurrentUser();

  const { data } = await leaderboardSupabase.rpc("get_leaderboard", {
    p_role: null,
    p_company_type: null,
  });

  const entries = toLiveLeaderboardEntries(
    (data ?? []) as SupabaseLeaderboardRow[],
    user?.id
  );

  return <LeaderboardClient entries={entries} />;
}
