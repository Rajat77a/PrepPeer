import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { hasCompletedProfile } from "@/lib/profile";
import { safeDashboardPath } from "@/lib/validation";
import { authCookieOptions } from "@/utils/authCookieOptions";
import {
  createSessionGuard,
  SESSION_GUARD_COOKIE,
  sessionGuardCookieOptions,
} from "@/utils/sessionSecurity";
import { getSupabaseConfig } from "@/utils/supabase/config";

const isFreshAuthUser = (createdAt?: string) => {
  if (!createdAt) return false;

  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) return false;

  return Date.now() - createdTime < 12 * 60 * 1000;
};

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeDashboardPath(searchParams.get("next"));
  const mode = searchParams.get("mode");
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    origin
  ).replace(/\/$/, "");

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/login?error=missing_code`);
  }

  const cookieStore = cookies();
  const { supabaseKey, supabaseUrl } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(`${siteUrl}/login?error=auth_not_configured`);
  }

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

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${siteUrl}/login?error=callback_failed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    isFreshAuthUser(user?.created_at) &&
    user &&
    !hasCompletedProfile(user)
  ) {
    const response = NextResponse.redirect(
      `${siteUrl}/onboarding?next=${encodeURIComponent(next)}`
    );
    const guard = await createSessionGuard(request, user.id);
    if (guard) {
      response.cookies.set(
        SESSION_GUARD_COOKIE,
        guard,
        sessionGuardCookieOptions
      );
    }
    return response;
  }

  const response = NextResponse.redirect(`${siteUrl}${next}`);
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
