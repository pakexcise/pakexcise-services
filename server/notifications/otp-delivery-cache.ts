import "server-only";

import type { SendEmailResult } from "@/server/notifications/send-email";

type CachedDelivery = {
  result: SendEmailResult;
  expiresAt: number;
};

const cache = new Map<string, CachedDelivery>();
const TTL_MS = 5 * 60 * 1000;

function cacheKey(email: string): string {
  return email.trim().toLowerCase();
}

export function rememberOtpDelivery(
  email: string,
  result: SendEmailResult,
): void {
  cache.set(cacheKey(email), {
    result,
    expiresAt: Date.now() + TTL_MS,
  });
}

export function getRememberedOtpDelivery(
  email: string,
): SendEmailResult | null {
  const entry = cache.get(cacheKey(email));

  if (!entry) {
    return null;
  }

  if (entry.expiresAt < Date.now()) {
    cache.delete(cacheKey(email));
    return null;
  }

  return entry.result;
}
