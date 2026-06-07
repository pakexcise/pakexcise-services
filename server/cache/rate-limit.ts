import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

const redis = getRedis();

export const publicFormRateLimit =
  redis &&
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "pakexcise:ratelimit:public-form",
  });

export const otpRateLimit =
  redis &&
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    analytics: true,
    prefix: "pakexcise:ratelimit:otp",
  });

export async function checkRateLimit(
  limiter: Ratelimit | false | null | undefined,
  identifier: string,
): Promise<{ success: boolean; remaining: number }> {
  if (!limiter) {
    return { success: true, remaining: 999 };
  }

  const result = await limiter.limit(identifier);
  return { success: result.success, remaining: result.remaining };
}
