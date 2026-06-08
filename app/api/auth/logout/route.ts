import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/server/auth";
import { withApiErrorHandler } from "@/lib/server/apiError";
import { clearSessionGuard } from "@/utils/sessionSecurity";

async function postLogout() {
  const { supabase, user } = await getAuthenticatedContext();

  if (user) {
    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) {
      return NextResponse.json(
        { error: "Could not sign out. Please try again." },
        { status: 400 }
      );
    }
  }

  const response = NextResponse.json({ ok: true });
  clearSessionGuard(response);
  return response;
}

export const POST = withApiErrorHandler(
  postLogout,
  "Unhandled logout API error"
);
