import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { sanitizePlainText } from "@/lib/validation";
import { getSupabaseConfig } from "@/utils/supabase/config";

export const updateSession = async (request: NextRequest) => {
  const { isConfigured, supabaseKey, supabaseUrl } = getSupabaseConfig();

  if (!isConfigured || !supabaseUrl || !supabaseKey) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );

        supabaseResponse = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  let user = null;

  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch {
    return supabaseResponse;
  }

  const protectedPaths = ["/dashboard", "/interview", "/results", "/onboarding"];
  const requiresAccount = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (requiresAccount && !user) {
    const loginUrl = new URL("/login", request.url);
    const nextPath = sanitizePlainText(
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    ).slice(0, 300);
    loginUrl.searchParams.set(
      "next",
      nextPath
    );
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
};
