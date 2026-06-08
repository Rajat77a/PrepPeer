import "server-only";

import type { NextRequest } from "next/server";
import { logServerError } from "@/lib/server/errorLog";
import { createAccountUnlockToken } from "@/lib/server/loginAttempts";

type AccountLockEmailInput = {
  email: string;
  ip: string;
  lockedUntil: number;
  request: NextRequest;
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });

const getSiteUrl = (request: NextRequest) =>
  (process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).replace(/\/$/, "");

const isPrivateOrUnknownIp = (ip: string) =>
  ip === "unknown" ||
  ip === "::1" ||
  ip === "127.0.0.1" ||
  ip.startsWith("10.") ||
  ip.startsWith("192.168.") ||
  /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip);

const getApproximateLocation = async (ip: string) => {
  if (isPrivateOrUnknownIp(ip)) return "Unknown location";

  try {
    const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "PrepPeer security alert",
      },
      signal: AbortSignal.timeout(2_500),
    });

    if (!response.ok) return "Unknown location";

    const data = (await response.json()) as {
      city?: unknown;
      region?: unknown;
      country_name?: unknown;
    };

    const parts = [data.city, data.region, data.country_name]
      .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
      .map((part) => part.trim());

    return parts.length > 0 ? parts.join(", ") : "Unknown location";
  } catch {
    return "Unknown location";
  }
};

export const sendAccountLockAlertEmail = async ({
  email,
  ip,
  lockedUntil,
  request,
}: AccountLockEmailInput) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    logServerError(
      "Account lock email skipped",
      new Error("Missing RESEND_API_KEY")
    );
    return;
  }

  const siteUrl = getSiteUrl(request);
  const unlockToken = createAccountUnlockToken(email, lockedUntil);
  if (!unlockToken) {
    logServerError(
      "Account unlock link could not be created",
      new Error("Missing login unlock secret")
    );
    return;
  }

  const attemptTime = new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
  const location = await getApproximateLocation(ip);
  const unlockUrl = `${siteUrl}/auth/unlock?token=${encodeURIComponent(unlockToken)}`;
  const changePasswordUrl = `${siteUrl}/login?auth=create-password`;
  const from = process.env.SECURITY_ALERT_FROM || "PrepPeer <onboarding@resend.dev>";

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0b1220; line-height: 1.6;">
      <h2 style="margin: 0 0 12px;">PrepPeer security alert</h2>
      <p>Someone tried to log into your account multiple times. If this wasn't you, please change your password.</p>
      <p><strong>Time:</strong> ${escapeHtml(attemptTime)}</p>
      <p><strong>Approximate location:</strong> ${escapeHtml(location)}</p>
      <p><strong>IP address:</strong> ${escapeHtml(ip)}</p>
      <p>
        <a href="${escapeHtml(unlockUrl)}" style="display:inline-block;padding:12px 18px;background:#006cff;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;">
          Unlock account
        </a>
      </p>
      <p>
        <a href="${escapeHtml(changePasswordUrl)}" style="color:#006cff;font-weight:700;">
          Change your password
        </a>
      </p>
      <p style="color:#667085;font-size:13px;">The temporary lock also expires automatically after 30 minutes.</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "PrepPeer security alert",
      html,
      text: [
        "Someone tried to log into your account multiple times. If this wasn't you, please change your password.",
        `Time: ${attemptTime}`,
        `Approximate location: ${location}`,
        `IP address: ${ip}`,
        `Unlock account: ${unlockUrl}`,
        `Change your password: ${changePasswordUrl}`,
        "The temporary lock also expires automatically after 30 minutes.",
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    logServerError(
      "Account lock email failed",
      new Error(`Resend returned ${response.status}`)
    );
  }
};
