import "server-only";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { validateCsrfRequest } from "@/lib/server/csrf";
import { logServerError } from "@/lib/server/errorLog";

type ApiRouteHandler<TArgs extends unknown[]> = (
  ...args: TArgs
) => Response | Promise<Response>;

export const withApiErrorHandler =
  <TArgs extends unknown[]>(
    handler: ApiRouteHandler<TArgs>,
    context: string
  ) =>
  async (...args: TArgs) => {
    try {
      const request = args[0] instanceof Request ? (args[0] as NextRequest) : null;
      const csrfResponse = request ? validateCsrfRequest(request) : null;
      if (csrfResponse) return csrfResponse;

      return await handler(...args);
    } catch (error) {
      logServerError(context, error);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  };
