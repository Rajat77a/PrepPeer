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

const createNonce = () =>
  btoa(crypto.randomUUID()).replace(/=+$/g, "");

const createContentSecurityPolicy = (nonce: string) =>
  [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${
      process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""
    }`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https://images.unsplash.com https://*.googleusercontent.com",
    "media-src 'self'",
    "connect-src 'self' https://*.supabase.co",
    "frame-src 'none'",
    "form-action 'self'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");

const getCanonicalOrigin = (request: NextRequest) => {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredUrl) {
    try {
      return new URL(configuredUrl).origin;
    } catch {
      // Fall through to the request origin when deployment configuration is invalid.
    }
  }

  return request.nextUrl.origin;
};

export async function middleware(request: NextRequest) {
  if (shouldRedirectToHttps(request)) {
    const secureUrl = request.nextUrl.clone();
    secureUrl.protocol = "https:";
    return NextResponse.redirect(secureUrl, 308);
  }

  const nonce = createNonce();
  const contentSecurityPolicy = createContentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  const response = await updateSession(request, requestHeaders);
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  response.headers.set("Access-Control-Allow-Origin", getCanonicalOrigin(request));
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
