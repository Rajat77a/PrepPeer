const isProduction = process.env.NODE_ENV === "production";

export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 30;

export const authCookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  secure: isProduction,
  maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
};
