import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { safeAuthenticatedPath } from "@/lib/validation";
import { authCookieOptions } from "@/utils/authCookieOptions";
import {
  createSessionGuard,
  SESSION_GUARD_COOKIE,
  sessionGuardCookieOptions,
} from "@/utils/sessionSecurity";
import { getSupabaseConfig } from "@/utils/supabase/config";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeAuthenticatedPath(searchParams.get("next"));

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/login?error=missing_token`);
  }

  const { supabaseKey, supabaseUrl } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(`${origin}/login?error=auth_not_configured`);
  }

  const cookieStore = cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookieOptions: authCookieOptions,
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

  const response = NextResponse.redirect(`${origin}${next}`);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const guard = await createSessionGuard(request, user.id);
    if (guard) {
      response.cookies.set(
        SESSION_GUARD_COOKIE,
        guard,
        sessionGuardCookieOptions
      );
    }
  }

  return response;
}
