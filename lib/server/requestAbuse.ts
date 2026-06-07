import "server-only";
import { NextResponse } from "next/server";
import { checkRateLimit } from "./rateLimit";
import { findAbusePattern } from "@/lib/validation";

const BURST_LIMIT = 10;
const BURST_WINDOW_MS = 60 * 1000;

const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
};

const logBlockedAttempt = (
  route: string,
  userId: string,
  ip: string,
  reason: string,
  fieldPath?: string
) => {
  console.warn("Blocked suspicious PrepPeer request", {
    route,
    userId,
    ip,
    reason,
    fieldPath,
  });
};

export const enforceRequestAbuseGuards = ({
  request,
  userId,
  route,
  body,
}: {
  request: Request;
  userId: string;
  route: string;
  body: unknown;
}):
  | { ok: true }
  | {
      ok: false;
      response: NextResponse;
    } => {
  const ip = getClientIp(request);
  const userBurst = checkRateLimit(
    `form-abuse:${route}:user:${userId}`,
    BURST_LIMIT,
    BURST_WINDOW_MS
  );
  const ipBurst = checkRateLimit(
    `form-abuse:${route}:ip:${ip}`,
    BURST_LIMIT,
    BURST_WINDOW_MS
  );

  if (!userBurst.allowed || !ipBurst.allowed) {
    const retryAfterSeconds = Math.max(
      userBurst.retryAfterSeconds,
      ipBurst.retryAfterSeconds
    );
    logBlockedAttempt(route, userId, ip, "burst rate limit");
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "Too many submissions in a short time. Please wait and try again.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfterSeconds) },
        }
      ),
    };
  }

  const abuseMatch = findAbusePattern(body);
  if (abuseMatch) {
    logBlockedAttempt(
      route,
      userId,
      ip,
      abuseMatch.reason,
      abuseMatch.fieldPath
    );
    return {
      ok: false,
      response: NextResponse.json(
        { error: "This submission contains unsafe content." },
        { status: 400 }
      ),
    };
  }

  return { ok: true };
};
