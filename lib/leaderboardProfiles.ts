import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeaderboardUserProfile } from "@/lib/ranking";

type LeaderboardProfileRow = {
  user_id: string;
  name: string | null;
  college?: string | null;
  target_role?: string | null;
  role?: string | null;
  target_company_type?: string | null;
  company_type?: string | null;
};

export const getLeaderboardUserProfiles = async (
  supabase: SupabaseClient
): Promise<Record<string, LeaderboardUserProfile>> => {
  const { data, error } = await supabase.rpc("get_leaderboard", {
    p_role: null,
    p_company_type: null,
  });

  if (error) {
    console.error("Unable to load leaderboard profiles:", error.message);
    return {};
  }

  return ((data ?? []) as LeaderboardProfileRow[]).reduce<
    Record<string, LeaderboardUserProfile>
  >((profiles, row) => {
    if (!row.user_id) return profiles;

    profiles[row.user_id] = {
      name: row.name?.trim() || undefined,
      college: row.college?.trim() || undefined,
      role: (row.target_role ?? row.role)?.trim() || undefined,
      companyType:
        (row.target_company_type ?? row.company_type)?.trim() || undefined,
    };

    return profiles;
  }, {});
};
