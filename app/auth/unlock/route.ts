import { NextResponse } from "next/server";
import {
  clearAccountLoginFailures,
  verifyAccountUnlockToken,
} from "@/lib/server/loginAttempts";
import { logSecurityEvent } from "@/lib/server/errorLog";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const payload = verifyAccountUnlockToken(token);

  if (!payload) {
    logSecurityEvent("Invalid account unlock link used", {
      path: url.pathname,
    });
    return NextResponse.redirect(`${url.origin}/login?error=auth`);
  }

  clearAccountLoginFailures(payload.emailHash);
  return NextResponse.redirect(`${url.origin}/login?unlocked=1`);
}
