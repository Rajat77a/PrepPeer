import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerConfig } from "@/utils/supabase/server-config";

export const createOptionalAdminClient = (): SupabaseClient | null => {
  const { serviceRoleKey, supabaseUrl } = getSupabaseServerConfig();

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
