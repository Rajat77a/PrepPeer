import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/server/rateLimit";
import {
  findAbusePattern,
  isPlainObject,
  isValidEmail,
  readJsonBody,
  sanitizePlainText,
} from "@/lib/validation";
import { getSupabaseConfig } from "@/utils/supabase/config";

const getClientIp = (request: NextRequest) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
};

const hashEmail = (email: string) =>
  createHash("sha256").update(email).digest("hex").slice(0, 32);

export async function POST(request: NextRequest) {
  const body = await readJsonBody(request, 2_000);
  if (!body.ok || !isPlainObject(body.data)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const abuseMatch = findAbusePattern(body.data);
  if (abuseMatch) {
    console.warn("Blocked suspicious auth request", {
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
  const ipLimit = checkRateLimit(`auth:otp:ip:${ip}`, 10, 60 * 1000);
  const emailLimit = checkRateLimit(
    `auth:otp:email:${hashEmail(email)}`,
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
    return NextResponse.json(
      { error: "Authentication is not configured yet." },
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
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
