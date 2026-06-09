import "server-only";

import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/server/rateLimit";

export const ONE_HOUR_MS = 60 * 60 * 1000;

export const enforceCostRateLimit = (
  key: string,
  limit: number,
  windowMs = ONE_HOUR_MS,
  message = "Too many requests for this feature. Please wait and try again."
) => {
  const rateLimit = checkRateLimit(`cost:${key}`, limit, windowMs);
  if (rateLimit.allowed) return null;

  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        "Retry-After": String(rateLimit.retryAfterSeconds),
      },
    }
  );
};
