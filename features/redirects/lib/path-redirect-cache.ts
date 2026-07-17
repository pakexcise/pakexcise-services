import { Redis } from "@upstash/redis";

import {
  destinationFromRedirectTarget,
  isPathRedirectKey,
  normalizeRedirectKey,
} from "@/features/redirects/lib/path-redirect-keys";

export const PATH_REDIRECT_CACHE_KEY = "pakexcise:path-redirects:v1";

export type PathRedirectEntry = {
  destination: string;
  statusCode: number;
};

export type PathRedirectMap = Record<string, PathRedirectEntry>;

let edgeRedis: Redis | null | undefined;

function getEdgeRedis(): Redis | null {
  if (edgeRedis !== undefined) {
    return edgeRedis;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    edgeRedis = null;
    return edgeRedis;
  }

  edgeRedis = new Redis({ url, token });
  return edgeRedis;
}

export function buildPathRedirectMap(
  rows: Array<{ oldSlug: string; newSlug: string; statusCode: number }>,
): PathRedirectMap {
  const map: PathRedirectMap = {};

  for (const row of rows) {
    if (!isPathRedirectKey(row.oldSlug)) {
      continue;
    }

    const from = normalizeRedirectKey(row.oldSlug);
    const destination = destinationFromRedirectTarget(row.newSlug);

    if (!from.startsWith("/") || !destination || destination === from) {
      continue;
    }

    map[from] = {
      destination,
      statusCode: row.statusCode === 302 ? 302 : 301,
    };
  }

  return map;
}

export async function readPathRedirectMap(): Promise<PathRedirectMap | null> {
  const redis = getEdgeRedis();

  if (!redis) {
    return null;
  }

  try {
    const value = await redis.get<PathRedirectMap>(PATH_REDIRECT_CACHE_KEY);
    return value && typeof value === "object" ? value : null;
  } catch {
    return null;
  }
}

export async function writePathRedirectMap(map: PathRedirectMap): Promise<boolean> {
  const redis = getEdgeRedis();

  if (!redis) {
    return false;
  }

  try {
    await redis.set(PATH_REDIRECT_CACHE_KEY, map);
    return true;
  } catch {
    return false;
  }
}

export async function lookupCachedPathRedirect(
  pathname: string,
): Promise<PathRedirectEntry | null> {
  const normalized = normalizeRedirectKey(pathname);

  if (!normalized.startsWith("/")) {
    return null;
  }

  if (
    normalized.startsWith("/admin") ||
    normalized.startsWith("/customer") ||
    normalized.startsWith("/agent") ||
    normalized.startsWith("/support") ||
    normalized.startsWith("/api") ||
    normalized.startsWith("/login") ||
    normalized.startsWith("/signup") ||
    normalized.startsWith("/auth")
  ) {
    return null;
  }

  const map = await readPathRedirectMap();

  if (!map) {
    return null;
  }

  return map[normalized] ?? map[normalized.replace(/^\//, "")] ?? null;
}
