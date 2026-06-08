import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { withApiErrorHandler } from "@/lib/server/apiError";
import { logSecurityEvent, logServerError } from "@/lib/server/errorLog";
import {
  clearLoginFailures,
  getClientIp,
  getLoginBlock,
  hashLoginEmail,
  INVALID_LOGIN_MESSAGE,
  recordFailedLoginAttempt,
} from "@/lib/server/loginAttempts";
import { sendAccountLockAlertEmail } from "@/lib/server/securityEmail";
import {
  findAbusePattern,
  isPlainObject,
  isValidEmail,
  readJsonBody,
  sanitizePlainText,
} from "@/lib/validation";
import { authCookieOptions } from "@/utils/authCookieOptions";
import { getSupabaseConfig } from "@/utils/supabase/config";

const genericLoginError = (status: 401 | 429, retryAfterSeconds = 0) =>
  NextResponse.json(
    { error: INVALID_LOGIN_MESSAGE },
    {
      status,
      headers:
        retryAfterSeconds > 0
          ? { "Retry-After": String(retryAfterSeconds) }
          : undefined,
    }
  );

async function postVerifyOtp(request: NextRequest) {
  const body = await readJsonBody(request, 2_000);
  if (!body.ok || !isPlainObject(body.data)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const abuseMatch = findAbusePattern(body.data);
  if (abuseMatch) {
    logSecurityEvent("Blocked suspicious OTP verification request", {
      fieldPath: abuseMatch.fieldPath,
      reason: abuseMatch.reason,
      ip: getClientIp(request),
    });
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = sanitizePlainText(String(body.data.email ?? "")).toLowerCase();
  const token = sanitizePlainText(String(body.data.token ?? ""));

  if (!isValidEmail(email) || !/^\d{6}$/.test(token)) {
    return genericLoginError(401);
  }

  const ip = getClientIp(request);
  const loginBlock = getLoginBlock(ip, email);
  if (loginBlock.blocked) {
    return genericLoginError(429, loginBlock.retryAfterSeconds);
  }

  const { supabaseKey, supabaseUrl } = getSupabaseConfig();
  if (!supabaseUrl || !supabaseKey) {
    logServerError("OTP verification is not configured", new Error("Missing Supabase config"));
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

  const response = NextResponse.json({ ok: true });
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookieOptions: authCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    const failedBlock = recordFailedLoginAttempt(ip, email);
    logSecurityEvent("Failed OTP verification", {
      emailHash: hashLoginEmail(email),
      ip,
      locked: failedBlock.blocked,
    });

    if (failedBlock.accountJustLocked) {
      await sendAccountLockAlertEmail({
        email,
        ip,
        lockedUntil: failedBlock.lockedUntil,
        request,
      });
    }

    return genericLoginError(
      failedBlock.blocked ? 429 : 401,
      failedBlock.retryAfterSeconds
    );
  }

  clearLoginFailures(ip, email);
  return response;
}

export const POST = withApiErrorHandler(
  postVerifyOtp,
  "Unhandled verify OTP API error"
);
