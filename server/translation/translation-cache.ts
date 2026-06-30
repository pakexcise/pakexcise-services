import "server-only";

import { createHash } from "node:crypto";

import { getRedisClient } from "@/server/cache/redis-client";

import { getTranslationCacheTtlSeconds } from "./config";

function buildCacheKey(targetLanguage: string, text: string): string {
  const hash = createHash("sha256").update(`${targetLanguage}:${text}`).digest("hex");
  return `auto-tr:${targetLanguage}:${hash}`;
}

export async function getCachedTranslation(
  targetLanguage: string,
  text: string,
): Promise<string | null> {
  const redis = getRedisClient();
  if (!redis) {
    return null;
  }

  try {
    const cached = await redis.get<string>(buildCacheKey(targetLanguage, text));
    return typeof cached === "string" ? cached : null;
  } catch {
    return null;
  }
}

export async function setCachedTranslation(
  targetLanguage: string,
  text: string,
  translated: string,
): Promise<void> {
  const redis = getRedisClient();
  if (!redis) {
    return;
  }

  try {
    await redis.set(buildCacheKey(targetLanguage, text), translated, {
      ex: getTranslationCacheTtlSeconds(),
    });
  } catch {
    // Cache failures should not block page rendering.
  }
}
