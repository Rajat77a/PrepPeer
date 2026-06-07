const isProduction = process.env.NODE_ENV === "production";

export const authCookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  secure: isProduction,
};
