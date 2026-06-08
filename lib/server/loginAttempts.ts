import "server-only";

import { createHash, createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const INVALID_LOGIN_MESSAGE = "Invalid email or password";

export const ACCOUNT_LOCK_MS = 30 * 60 * 1000;
const IP_LOCK_MS = 15 * 60 * 1000;
const IP_FAILED_LOGIN_LIMIT = 5;
const ACCOUNT_FAILED_LOGIN_LIMIT = 10;

type FailureState = {
  count: number;
  expiresAt: number;
  lockedUntil: number;
};

const ipFailures = new Map<string, FailureState>();
const accountFailures = new Map<string, FailureState>();

const now = () => Date.now();

export const getClientIp = (request: NextRequest) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
};

export const hashLoginEmail = (email: string) =>
  createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 32);

const readState = (store: Map<string, FailureState>, key: string) => {
  const state = store.get(key);
  if (!state) return null;

  if (state.expiresAt <= now() && state.lockedUntil <= now()) {
    store.delete(key);
    return null;
  }

  return state;
};

const retryAfter = (state: FailureState) =>
  Math.max(1, Math.ceil((state.lockedUntil - now()) / 1000));

const isLocked = (state: FailureState | null) =>
  Boolean(state && state.lockedUntil > now());

const bumpFailure = (
  store: Map<string, FailureState>,
  key: string,
  limit: number,
  lockMs: number
) => {
  const existing = readState(store, key);
  const state: FailureState = existing ?? {
    count: 0,
    expiresAt: now() + lockMs,
    lockedUntil: 0,
  };

  state.count += 1;
  state.expiresAt = now() + lockMs;

  if (state.count >= limit) {
    state.lockedUntil = now() + lockMs;
  }

  store.set(key, state);
  return state;
};

export const getLoginBlock = (ip: string, email: string) => {
  const ipState = readState(ipFailures, ip);
  const accountState = readState(accountFailures, hashLoginEmail(email));

  const lockedStates = [ipState, accountState].filter(isLocked);
  if (lockedStates.length === 0) {
    return { blocked: false, retryAfterSeconds: 0 };
  }

  return {
    blocked: true,
    retryAfterSeconds: Math.max(...lockedStates.map((state) => retryAfter(state!))),
  };
};

export const recordFailedLoginAttempt = (ip: string, email: string) => {
  const accountKey = hashLoginEmail(email);
  const previousAccountState = readState(accountFailures, accountKey);

  bumpFailure(ipFailures, ip, IP_FAILED_LOGIN_LIMIT, IP_LOCK_MS);
  const accountState = bumpFailure(
    accountFailures,
    accountKey,
    ACCOUNT_FAILED_LOGIN_LIMIT,
    ACCOUNT_LOCK_MS
  );

  const accountJustLocked =
    accountState.lockedUntil > now() &&
    (!previousAccountState || previousAccountState.lockedUntil <= now());

  return {
    ...getLoginBlock(ip, email),
    accountJustLocked,
    lockedUntil: accountState.lockedUntil,
  };
};

export const getAccountLockState = (email: string) => {
  const state = readState(accountFailures, hashLoginEmail(email));
  return {
    locked: isLocked(state),
    lockedUntil: state?.lockedUntil ?? 0,
    retryAfterSeconds: state && isLocked(state) ? retryAfter(state) : 0,
  };
};

export const clearAccountLoginFailures = (emailHash: string) => {
  accountFailures.delete(emailHash);
};

export const clearLoginFailures = (ip: string, email: string) => {
  ipFailures.delete(ip);
  accountFailures.delete(hashLoginEmail(email));
};

const getUnlockSecret = () =>
  process.env.LOGIN_UNLOCK_SECRET ?? process.env.SESSION_BINDING_SECRET ?? "";

const signUnlockPayload = (payload: string) =>
  createHmac("sha256", getUnlockSecret()).update(payload).digest("base64url");

export const createAccountUnlockToken = (email: string, expiresAt: number) => {
  if (!getUnlockSecret()) return null;

  const payload = JSON.stringify({
    emailHash: hashLoginEmail(email),
    expiresAt,
  });
  const encodedPayload = Buffer.from(payload).toString("base64url");
  return `${encodedPayload}.${signUnlockPayload(encodedPayload)}`;
};

export const verifyAccountUnlockToken = (token: string) => {
  if (!getUnlockSecret()) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = signUnlockPayload(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as { emailHash?: unknown; expiresAt?: unknown };

    if (
      typeof payload.emailHash !== "string" ||
      typeof payload.expiresAt !== "number" ||
      !Number.isFinite(payload.expiresAt) ||
      payload.expiresAt <= now()
    ) {
      return null;
    }

    return {
      emailHash: payload.emailHash,
      expiresAt: payload.expiresAt,
    };
  } catch {
    return null;
  }
};
