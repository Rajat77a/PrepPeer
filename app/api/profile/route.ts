import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/server/auth";
import { checkRateLimit } from "@/lib/server/rateLimit";
import { enforceRequestAbuseGuards } from "@/lib/server/requestAbuse";
import { createOptionalAdminClient } from "@/utils/supabase/admin";
import {
  parseProfileInput,
  readJsonBody,
} from "@/lib/validation";

export async function PATCH(req: NextRequest) {
  const { user } = await getAuthenticatedContext();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createOptionalAdminClient();
  if (!admin) {
    return NextResponse.json(
      {
        error:
          "Secure profile storage is not configured. Add SUPABASE_SECRET_KEY to the server environment.",
      },
      { status: 503 }
    );
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

  const abuseGuard = enforceRequestAbuseGuards({
    request: req,
    userId: user.id,
    route: "profile",
    body: body.data,
  });
  if (!abuseGuard.ok) return abuseGuard.response;

  try {
    const profile = parseProfileInput(body.data);
    if (!profile) {
      return NextResponse.json(
        { error: "Please provide valid profile details." },
        { status: 400 }
      );
    }

    const { error } = await admin.auth.admin.updateUserById(user.id, {
      app_metadata: {
        ...user.app_metadata,
        preppeer_profile: {
          fullName: profile.fullName,
          college: profile.college,
          role: profile.role,
          experience: profile.experience,
          company: profile.company,
          onboardingComplete: true,
        },
      },
      user_metadata: {
        ...user.user_metadata,
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
