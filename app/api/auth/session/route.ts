import { type NextRequest, NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/server/auth";
import {
  createSessionGuard,
  sessionGuardCookieOptions,
  SESSION_GUARD_COOKIE,
} from "@/utils/sessionSecurity";

export async function POST(request: NextRequest) {
  const { user } = await getAuthenticatedContext();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const guard = await createSessionGuard(request, user.id);
  if (!guard) {
    return NextResponse.json(
      { error: "Session protection is not configured." },
      { status: 503 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    SESSION_GUARD_COOKIE,
    guard,
    sessionGuardCookieOptions
  );
  return response;
}
