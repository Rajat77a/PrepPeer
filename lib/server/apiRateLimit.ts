import "server-only";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/server/auth";
import { checkRateLimit } from "@/lib/server/rateLimit";
import { getClientIp } from "@/lib/server/loginAttempts";

type ApiRateLimitPolicy = {
  category: "auth" | "read" | "write" | "upload";
  limit: number;
  windowMs: number;
  scope: "ip" | "user";
};

const ONE_MINUTE_MS = 60 * 1000;

const getPolicy = (request: NextRequest): ApiRateLimitPolicy | null => {
  const method = request.method.toUpperCase();
  if (method === "OPTIONS" || method === "HEAD") return null;

  const path = request.nextUrl.pathname;

  if (path.startsWith("/api/auth/")) {
    return {
      category: "auth",
      limit: 10,
      windowMs: ONE_MINUTE_MS,
      scope: "ip",
    };
  }

  if (path.includes("upload")) {
    return {
      category: "upload",
      limit: 10,
      windowMs: ONE_MINUTE_MS,
      scope: "user",
    };
  }

  if (method === "GET") {
    return {
      category: "read",
      limit: 100,
      windowMs: ONE_MINUTE_MS,
      scope: "user",
    };
  }

  return {
    category: "write",
    limit: 30,
    windowMs: ONE_MINUTE_MS,
    scope: "user",
  };
};

const getIdentity = async (
  request: NextRequest,
  scope: ApiRateLimitPolicy["scope"]
) => {
  const ip = getClientIp(request);

  if (scope === "ip") {
    return `ip:${ip}`;
  }

  try {
    const { user } = await getAuthenticatedContext();
    if (user?.id) {
      return `user:${user.id}`;
    }
  } catch {
    // Fall back to IP limiting when the user session cannot be read yet.
  }

  return `ip:${ip}`;
};

export const enforceApiRateLimit = async (request: NextRequest) => {
  const policy = getPolicy(request);
  if (!policy) return null;

  const identity = await getIdentity(request, policy.scope);
  const rateLimit = checkRateLimit(
    `api:${policy.category}:${request.method}:${request.nextUrl.pathname}:${identity}`,
    policy.limit,
    policy.windowMs
  );

  if (rateLimit.allowed) return null;

  return NextResponse.json(
    { error: "Too many requests. Please wait and try again." },
    {
      status: 429,
      headers: {
        "Retry-After": String(rateLimit.retryAfterSeconds),
      },
    }
  );
};
