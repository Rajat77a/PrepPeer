const isProduction = process.env.NODE_ENV === "production";

export const authCookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  secure: isProduction,
  maxAge: 60 * 60 * 24 * 30,
};
