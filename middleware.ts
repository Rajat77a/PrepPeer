import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

const shouldRedirectToHttps = (request: NextRequest) => {
  const host = request.nextUrl.hostname;
  if (LOCAL_HOSTS.has(host)) return false;

  const forwardedProto = request.headers.get("x-forwarded-proto");
  return request.nextUrl.protocol === "http:" || forwardedProto === "http";
};

export async function middleware(request: NextRequest) {
  if (shouldRedirectToHttps(request)) {
    const secureUrl = request.nextUrl.clone();
    secureUrl.protocol = "https:";
    return NextResponse.redirect(secureUrl, 308);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
