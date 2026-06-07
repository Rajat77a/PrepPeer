import { createBrowserClient } from "@supabase/ssr";
import { authCookieOptions } from "@/utils/authCookieOptions";
import { getSupabaseConfig } from "@/utils/supabase/config";

export const createClient = () => {
  const { supabaseKey, supabaseUrl } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createBrowserClient(supabaseUrl, supabaseKey, {
    cookieOptions: authCookieOptions,
  });
};
