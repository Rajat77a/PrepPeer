import "server-only";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export const getAuthenticatedContext = async () => {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return {
    supabase,
    user: error ? null : user,
  };
};
