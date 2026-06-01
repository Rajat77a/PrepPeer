import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeaderboardUserProfile } from "@/lib/ranking";

type LeaderboardProfileRow = {
  user_id: string;
  name: string | null;
  college?: string | null;
};

export const getLeaderboardUserProfiles = async (
  supabase: SupabaseClient
): Promise<Record<string, LeaderboardUserProfile>> => {
  const { data } = await supabase.rpc("get_leaderboard", {
    p_role: null,
    p_company_type: null,
  });

  return ((data ?? []) as LeaderboardProfileRow[]).reduce<
    Record<string, LeaderboardUserProfile>
  >((profiles, row) => {
    if (!row.user_id) return profiles;

    profiles[row.user_id] = {
      name: row.name?.trim() || undefined,
      college: row.college?.trim() || undefined,
    };

    return profiles;
  }, {});
};
