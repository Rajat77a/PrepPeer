import "server-only";

import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getAuthenticatedContext } from "@/lib/server/auth";
import { logSecurityEvent } from "@/lib/server/errorLog";

type AccessContext = {
  supabase: SupabaseClient;
  user: User;
};

type ProtectedRouteOptions = {
  request?: NextRequest;
  resource: string;
  authorize: (context: AccessContext) => boolean | Promise<boolean>;
};

type ProtectedRouteResult =
  | (AccessContext & { ok: true })
  | { ok: false; response: NextResponse };

const getRequestIp = (request?: NextRequest) => {
  const forwardedFor = request?.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return request?.headers.get("x-real-ip")?.trim() || "unknown";
};

const logUnauthorizedAccess = ({
  request,
  resource,
  userId,
}: {
  request?: NextRequest;
  resource: string;
  userId: string;
}) => {
  logSecurityEvent("Unauthorized resource access blocked", {
    resource,
    userId,
    method: request?.method ?? "unknown",
    path: request ? new URL(request.url).pathname : "unknown",
    ip: getRequestIp(request),
    userAgent: request?.headers.get("user-agent") ?? "unknown",
  });
};

export const requireProtectedRoute = async ({
  request,
  resource,
  authorize,
}: ProtectedRouteOptions): Promise<ProtectedRouteResult> => {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const authorized = await authorize({ supabase, user });

  if (!authorized) {
    logUnauthorizedAccess({ request, resource, userId: user.id });
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, supabase, user };
};
