import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/server/auth";
import { checkRateLimit } from "@/lib/server/rateLimit";
import {
  parseProfileInput,
  readJsonBody,
} from "@/lib/validation";

export async function PATCH(req: NextRequest) {
  const { supabase, user } = await getAuthenticatedContext();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit(
    `profile:${user.id}`,
    20,
    10 * 60 * 1000
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many profile updates. Please wait and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const body = await readJsonBody(req, 8_000);
  if (!body.ok) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const profile = parseProfileInput(body.data);
    if (!profile) {
      return NextResponse.json(
        { error: "Please provide valid profile details." },
        { status: 400 }
      );
    }

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: profile.fullName,
        name: profile.fullName,
        college: profile.college,
        target_role: profile.role,
        experience_level: profile.experience,
        target_company_type: profile.company,
        onboarding_complete: true,
      },
    });

    if (error) {
      return NextResponse.json(
        { error: "Profile could not be saved." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
