import type { Metadata } from "next";
import { cookies } from "next/headers";
import { LeaderboardClient } from "@/components/dashboard/LeaderboardClient";
import {
  toLiveLeaderboardEntries,
  type SupabaseLeaderboardRow,
} from "@/lib/liveLeaderboard";
import { getTrustedProfile } from "@/lib/profile";
import { logServerError } from "@/lib/server/errorLog";
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

  const { data, error } = await leaderboardSupabase.rpc("get_leaderboard", {
    p_role: null,
    p_company_type: null,
  });

  if (error) {
    logServerError("Unable to load the live leaderboard", error);
  }

  const rawEntries = toLiveLeaderboardEntries(
    (data ?? []) as SupabaseLeaderboardRow[],
    user?.id
  );

  const profile = user ? getTrustedProfile(user) : null;
  const profileRole = profile?.role ?? "";
  const profileCompanyType = profile?.company ?? "";
  const profileCollege = profile?.college ?? "";

  const entries = rawEntries.map((entry) => {
    if (!entry.isYou) return entry;

    const role = profileRole || entry.role || "Interview";
    const companyType = profileCompanyType || entry.companyType || "General";

    return {
      ...entry,
      role,
      companyType,
      subtitle: `${profileCollege ? `${profileCollege} - ` : ""}${role} - ${companyType}`,
    };
  });

  return (
    <LeaderboardClient
      entries={entries}
      loadError={
        error
          ? "The live leaderboard could not be loaded. Refresh after the database update is applied."
          : undefined
      }
    />
  );
}
