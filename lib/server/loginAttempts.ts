import "server-only";

import { createHash } from "crypto";
import type { NextRequest } from "next/server";

export const INVALID_LOGIN_MESSAGE = "Invalid email or password";

const LOGIN_LOCK_MS = 15 * 60 * 1000;
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
  limit: number
) => {
  const existing = readState(store, key);
  const state: FailureState = existing ?? {
    count: 0,
    expiresAt: now() + LOGIN_LOCK_MS,
    lockedUntil: 0,
  };

  state.count += 1;
  state.expiresAt = now() + LOGIN_LOCK_MS;

  if (state.count >= limit) {
    state.lockedUntil = now() + LOGIN_LOCK_MS;
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
  bumpFailure(ipFailures, ip, IP_FAILED_LOGIN_LIMIT);
  bumpFailure(accountFailures, hashLoginEmail(email), ACCOUNT_FAILED_LOGIN_LIMIT);
  return getLoginBlock(ip, email);
};

export const clearLoginFailures = (ip: string, email: string) => {
  ipFailures.delete(ip);
  accountFailures.delete(hashLoginEmail(email));
};
