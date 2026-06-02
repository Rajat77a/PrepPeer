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
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const mode = searchParams.get("mode");
  const siteUrl = "https://prep-peer.vercel.app";

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
  const hasRequiredProfile =
    Boolean(user?.user_metadata?.full_name ?? user?.user_metadata?.name) &&
    Boolean(user?.user_metadata?.college);

  if (mode === "signup" && !hasRequiredProfile) {
    return NextResponse.redirect(
      `${siteUrl}/onboarding?next=${encodeURIComponent(next)}`
    );
  }

  return NextResponse.redirect(`${siteUrl}${next}`);
}
