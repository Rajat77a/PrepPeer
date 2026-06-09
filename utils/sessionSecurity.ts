import { NextResponse } from "next/server";
import { authCookieOptions } from "@/utils/authCookieOptions";

export const SESSION_GUARD_COOKIE = "pp_session_guard";

const encoder = new TextEncoder();

export const sessionGuardCookieOptions = {
  ...authCookieOptions,
  httpOnly: true,
  maxAge: 60 * 60 * 24,
};

type SessionGuard = {
  uid: string;
  ua: string;
  ip: string;
  nonce: string;
  iat: number;
};

const getSecret = () =>
  process.env.SESSION_BINDING_SECRET ??
  process.env.SUPABASE_SECRET_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  "";

const toBase64Url = (value: ArrayBuffer | string) => {
  const bytes =
    typeof value === "string" ? encoder.encode(value) : new Uint8Array(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const fromBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  return atob(padded);
};

const sha256 = async (value: string) =>
  toBase64Url(await crypto.subtle.digest("SHA-256", encoder.encode(value)));

const hmac = async (value: string) => {
  const secret = getSecret();
  if (!secret) return "";

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
};

const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const raw =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown";

  if (raw.includes(":")) {
    return raw.split(":").slice(0, 4).join(":");
  }

  return raw.split(".").slice(0, 3).join(".");
};

export const getSessionFingerprint = async (request: Request) => {
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  return {
    ip: await sha256(getClientIp(request)),
    ua: await sha256(userAgent),
  };
};

export const createSessionGuard = async (
  request: Request,
  userId: string
) => {
  const fingerprint = await getSessionFingerprint(request);
  const payload: SessionGuard = {
    uid: userId,
    ua: fingerprint.ua,
    ip: fingerprint.ip,
    nonce: crypto.randomUUID(),
    iat: Date.now(),
  };
  const body = toBase64Url(JSON.stringify(payload));
  const signature = await hmac(body);

  if (!signature) return null;

  return `${body}.${signature}`;
};

export const readSessionGuard = async (value: string | undefined) => {
  if (!value) return null;

  const [body, signature] = value.split(".");
  if (!body || !signature) return null;

  const expectedSignature = await hmac(body);
  if (!expectedSignature || expectedSignature !== signature) return null;

  try {
    return JSON.parse(fromBase64Url(body)) as SessionGuard;
  } catch {
    return null;
  }
};

export const clearSessionGuard = (response: NextResponse) => {
  response.cookies.set(SESSION_GUARD_COOKIE, "", {
    ...sessionGuardCookieOptions,
    maxAge: 0,
  });
};
