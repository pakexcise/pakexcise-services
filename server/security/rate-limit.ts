import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { AuthError } from "@/lib/errors/auth-errors";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

const redis = getRedis();

function createLimiter(
  prefix: string,
  limit: number,
  window: `${number} s` | `${number} m` | `${number} h`,
): Ratelimit | null {
  if (!redis) {
    return null;
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    analytics: true,
    prefix,
  });
}

export const publicFormRateLimit = createLimiter(
  "pakexcise:ratelimit:public-form",
  10,
  "1 m",
);

export const reviewSubmissionRateLimit = createLimiter(
  "pakexcise:ratelimit:review-submission",
  3,
  "1 h",
);

/** First-party activity events (page_view etc.) — far higher than form spam limits. */
export const activityEventRateLimit = createLimiter(
  "pakexcise:ratelimit:activity-event",
  180,
  "1 m",
);

export const trackLookupRateLimit = createLimiter(
  "pakexcise:ratelimit:track-lookup",
  8,
  "1 m",
);

export const otpRateLimit = createLimiter("pakexcise:ratelimit:otp", 3, "1 h");

export const loginRateLimit = createLimiter(
  "pakexcise:ratelimit:login",
  10,
  "15 m",
);

export const serverActionRateLimit = createLimiter(
  "pakexcise:ratelimit:server-action",
  60,
  "1 m",
);

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  reset: number;
};

export async function checkRateLimit(
  limiter: Ratelimit | null | undefined,
  identifier: string,
): Promise<RateLimitResult> {
  if (!limiter) {
    return { success: true, remaining: 999, reset: 0 };
  }

  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export async function enforceRateLimit(
  limiter: Ratelimit | null | undefined,
  identifier: string,
): Promise<RateLimitResult> {
  const result = await checkRateLimit(limiter, identifier);

  if (!result.success) {
    throw new AuthError("RATE_LIMITED", "Too many requests. Please try again later.");
  }

  return result;
}
