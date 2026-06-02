import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/utils/supabase/config";

export const createOptionalAdminClient = (): SupabaseClient | null => {
  const { serviceRoleKey, supabaseUrl } = getSupabaseConfig();

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
