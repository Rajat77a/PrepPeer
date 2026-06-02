import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseConfig } from "@/utils/supabase/config";

const safeNextPath = (next: string | null) => {
  if (!next || !next.startsWith("/dashboard") || next.startsWith("//")) {
    return "/dashboard";
  }

  return next;
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"));

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/login?error=missing_token`);
  }

  const { supabaseKey, supabaseUrl } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(`${origin}/login?error=auth_not_configured`);
  }

  const cookieStore = cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) =>
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        ),
    },
  });

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=verification_failed`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
