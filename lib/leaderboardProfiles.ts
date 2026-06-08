import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeaderboardUserProfile } from "@/lib/ranking";
import { logServerError } from "@/lib/server/errorLog";
import { getSafeOptionalString } from "@/lib/validation";

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
    logServerError("Unable to load leaderboard profiles", error);
    return {};
  }

  return ((data ?? []) as LeaderboardProfileRow[]).reduce<
    Record<string, LeaderboardUserProfile>
  >((profiles, row) => {
    if (!row.user_id) return profiles;

    profiles[row.user_id] = {
      name: getSafeOptionalString(row.name, 80) || undefined,
      college: getSafeOptionalString(row.college, 120) || undefined,
      role: getSafeOptionalString(row.target_role ?? row.role, 80) || undefined,
      companyType:
        getSafeOptionalString(row.target_company_type ?? row.company_type, 80) ||
        undefined,
    };

    return profiles;
  }, {});
};
