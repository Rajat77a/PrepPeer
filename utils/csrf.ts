const isProduction = process.env.NODE_ENV === "production";

export const CSRF_COOKIE = "pp_csrf_token";
export const CSRF_HEADER = "x-csrf-token";

export const csrfCookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  secure: isProduction,
  maxAge: 60 * 60 * 24 * 7,
};

export const createCsrfToken = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const getBrowserCsrfToken = () => {
  if (typeof document === "undefined") return "";

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${CSRF_COOKIE}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
};

export const csrfHeaders = (
  headers: Record<string, string> = {}
): Record<string, string> => {
  const token = getBrowserCsrfToken();

  return token
    ? {
        ...headers,
        [CSRF_HEADER]: token,
      }
    : headers;
};
