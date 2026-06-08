import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/server/auth";
import { withApiErrorHandler } from "@/lib/server/apiError";
import { checkRateLimit } from "@/lib/server/rateLimit";
import { logServerError } from "@/lib/server/errorLog";
import { isPlainObject, readJsonBody } from "@/lib/validation";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const PASSWORD_ATTEMPT_LIMIT = 5;
const PASSWORD_ATTEMPT_WINDOW_MS = 60 * 1000;

const getClientIp = (request: NextRequest) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
};

const getSha1 = (value: string) =>
  createHash("sha1").update(value).digest("hex").toUpperCase();

const isBreachedPassword = async (password: string) => {
  const hash = getSha1(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const response = await fetch(
    `https://api.pwnedpasswords.com/range/${prefix}`,
    {
      headers: {
        "Add-Padding": "true",
        "User-Agent": "PrepPeer password safety check",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Password safety check failed.");
  }

  const results = await response.text();
  return results
    .split("\n")
    .some((line) => line.split(":")[0]?.trim().toUpperCase() === suffix);
};

async function postPasswordUpdate(request: NextRequest) {
  const { supabase, user } = await getAuthenticatedContext();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(request);
  const userLimit = checkRateLimit(
    `auth:password:user:${user.id}`,
    PASSWORD_ATTEMPT_LIMIT,
    PASSWORD_ATTEMPT_WINDOW_MS
  );
  const ipLimit = checkRateLimit(
    `auth:password:ip:${ip}`,
    PASSWORD_ATTEMPT_LIMIT,
    PASSWORD_ATTEMPT_WINDOW_MS
  );

  if (!userLimit.allowed || !ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many password attempts. Please wait and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(userLimit.retryAfterSeconds, ipLimit.retryAfterSeconds)
          ),
        },
      }
    );
  }

  const body = await readJsonBody(request, 2_000);
  if (!body.ok || !isPlainObject(body.data)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const password = body.data.password;
  if (
    typeof password !== "string" ||
    password.length < MIN_PASSWORD_LENGTH ||
    password.length > MAX_PASSWORD_LENGTH
  ) {
    return NextResponse.json(
      { error: "Use a password between 8 and 128 characters." },
      { status: 400 }
    );
  }

  try {
    if (await isBreachedPassword(password)) {
      return NextResponse.json(
        {
          error:
            "This password appears in public breach data. Choose a less common password.",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    logServerError("Password safety check failed", error, { userId: user.id });
    return NextResponse.json(
      {
        error:
          "Password safety check is temporarily unavailable. Please try again.",
      },
      { status: 503 }
    );
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    logServerError("Password update failed", error, { userId: user.id });
    return NextResponse.json(
      { error: "Password could not be saved." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}

export const POST = withApiErrorHandler(
  postPasswordUpdate,
  "Unhandled password API error"
);
