import "server-only";

import { Redis } from "@upstash/redis";

import { processPendingNotifications } from "@/features/notifications/dispatcher/process-batch";

const QUEUE_KEY = "notifications:dispatch";

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

/**
 * Queue abstraction: push IDs to Upstash list and trigger background processing.
 * QStash/cron can call POST /api/notifications/process for the same worker.
 */
export async function scheduleNotificationDispatch(
  notificationIds: string[] = [],
): Promise<void> {
  const redis = getRedisClient();

  if (redis && notificationIds.length > 0) {
    await redis.lpush(QUEUE_KEY, ...notificationIds);
  }

  void processPendingNotifications({ limit: 25 }).catch((error) => {
    console.error(
      "[notifications] background dispatch failed",
      error instanceof Error ? error.message : error,
    );
  });
}

export async function drainNotificationQueue(limit = 25): Promise<number> {
  const redis = getRedisClient();

  if (!redis) {
    return 0;
  }

  const ids = await redis.lrange<string>(QUEUE_KEY, 0, limit - 1);

  if (ids.length === 0) {
    return 0;
  }

  await redis.ltrim(QUEUE_KEY, ids.length, -1);
  return ids.length;
}
