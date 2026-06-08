import "server-only";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { CSRF_COOKIE, CSRF_HEADER } from "@/utils/csrf";
import { logSecurityEvent } from "@/lib/server/errorLog";

const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const normalizeOrigin = (value: string | undefined | null) => {
  if (!value) return "";

  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
};

const getAllowedOrigins = (request: NextRequest) => {
  const origins = new Set<string>([request.nextUrl.origin]);
  const publicSiteUrl = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  const vercelUrl = process.env.VERCEL_URL
    ? normalizeOrigin(`https://${process.env.VERCEL_URL}`)
    : "";

  if (publicSiteUrl) origins.add(publicSiteUrl);
  if (vercelUrl) origins.add(vercelUrl);

  return origins;
};

const hasTrustedOrigin = (request: NextRequest) => {
  const allowedOrigins = getAllowedOrigins(request);
  const origin = normalizeOrigin(request.headers.get("origin"));
  const referer = normalizeOrigin(request.headers.get("referer"));

  return (
    (origin && allowedOrigins.has(origin)) ||
    (!origin && referer && allowedOrigins.has(referer))
  );
};

export const validateCsrfRequest = (request: NextRequest) => {
  if (!STATE_CHANGING_METHODS.has(request.method.toUpperCase())) return null;

  if (!hasTrustedOrigin(request)) {
    logSecurityEvent("Blocked state-changing request with untrusted origin", {
      method: request.method,
      path: request.nextUrl.pathname,
      origin: request.headers.get("origin") ?? "",
      referer: request.headers.get("referer") ?? "",
    });
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const token = request.headers.get(CSRF_HEADER) ?? "";
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value ?? "";

  if (!token || !cookieToken || token !== cookieToken) {
    logSecurityEvent("Blocked state-changing request with invalid CSRF token", {
      method: request.method,
      path: request.nextUrl.pathname,
    });
    return NextResponse.json({ error: "Invalid request token." }, { status: 403 });
  }

  return null;
};
