import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { withApiErrorHandler } from "@/lib/server/apiError";
import {
  getClientIp,
  getLoginBlock,
  hashLoginEmail,
  INVALID_LOGIN_MESSAGE,
} from "@/lib/server/loginAttempts";
import { checkRateLimit } from "@/lib/server/rateLimit";
import { logSecurityEvent, logServerError } from "@/lib/server/errorLog";
import {
  findAbusePattern,
  isPlainObject,
  isValidEmail,
  readJsonBody,
  sanitizePlainText,
} from "@/lib/validation";
import { getSupabaseConfig } from "@/utils/supabase/config";

async function postSendOtp(request: NextRequest) {
  const body = await readJsonBody(request, 2_000);
  if (!body.ok || !isPlainObject(body.data)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const abuseMatch = findAbusePattern(body.data);
  if (abuseMatch) {
    logSecurityEvent("Blocked suspicious auth request", {
      fieldPath: abuseMatch.fieldPath,
      reason: abuseMatch.reason,
      ip: getClientIp(request),
    });
    return NextResponse.json(
      { error: "This sign-in request contains unsafe content." },
      { status: 400 }
    );
  }

  const email = sanitizePlainText(String(body.data.email ?? "")).toLowerCase();
  const mode = body.data.mode;
  const signupNonce =
    typeof body.data.signupNonce === "string"
      ? sanitizePlainText(body.data.signupNonce).slice(0, 120)
      : "";

  if (!isValidEmail(email) || (mode !== "signin" && mode !== "signup")) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  const ip = getClientIp(request);
  const loginBlock = getLoginBlock(ip, email);
  if (loginBlock.blocked) {
    return NextResponse.json(
      { error: INVALID_LOGIN_MESSAGE },
      {
        status: 429,
        headers: {
          "Retry-After": String(loginBlock.retryAfterSeconds),
        },
      }
    );
  }

  const ipLimit = checkRateLimit(`auth:otp:ip:${ip}`, 10, 60 * 1000);
  const emailLimit = checkRateLimit(
    `auth:otp:email:${hashLoginEmail(email)}`,
    5,
    10 * 60 * 1000
  );

  if (!ipLimit.allowed || !emailLimit.allowed) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Please wait and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(ipLimit.retryAfterSeconds, emailLimit.retryAfterSeconds)
          ),
        },
      }
    );
  }

  const { supabaseKey, supabaseUrl } = getSupabaseConfig();
  if (!supabaseUrl || !supabaseKey) {
    logServerError("OTP auth is not configured", new Error("Missing Supabase config"));
    return NextResponse.json(
      { error: "Sign-in is temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: mode === "signup",
      data:
        mode === "signup" && signupNonce
          ? { preppeer_signup_nonce: signupNonce }
          : undefined,
    },
  });

  if (error) {
    logServerError("OTP sign-in failed", error, {
      mode,
      emailHash: hashLoginEmail(email),
    });
    return NextResponse.json(
      { error: INVALID_LOGIN_MESSAGE },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}

export const POST = withApiErrorHandler(
  postSendOtp,
  "Unhandled send OTP API error"
);
