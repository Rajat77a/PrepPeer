import "server-only";

import { NextResponse } from "next/server";
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
      return await handler(...args);
    } catch (error) {
      logServerError(context, error);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }
  };
