import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { hasCompletedProfile } from "@/lib/profile";
import { safeDashboardPath } from "@/lib/validation";
import { getSupabaseConfig } from "@/utils/supabase/config";

const isFreshAuthUser = (createdAt?: string) => {
  if (!createdAt) return false;

  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) return false;

  return Date.now() - createdTime < 12 * 60 * 1000;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeDashboardPath(searchParams.get("next"));
  const mode = searchParams.get("mode");
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    "http://localhost:3000";

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/login?error=missing_code`);
  }

  const cookieStore = cookies();
  const { supabaseKey, supabaseUrl } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(`${siteUrl}/login?error=auth_not_configured`);
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
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
    return NextResponse.redirect(
      `${siteUrl}/onboarding?next=${encodeURIComponent(next)}`
    );
  }

  return NextResponse.redirect(`${siteUrl}${next}`);
}
