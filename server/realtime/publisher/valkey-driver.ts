import "server-only";

import { getRedisClient } from "@/server/cache/redis-client";
import {
  memoryRealtimePublisher,
  publishToUsersMemory,
} from "@/server/realtime/publisher/memory-driver";
import type {
  RealtimePublisherDriver,
  RealtimeServerEvent,
  RealtimeSubscriber,
} from "@/server/realtime/publisher/types";

function channelForUser(userId: string): string {
  return `realtime:user:${userId}`;
}

/**
 * Valkey/Redis pub/sub driver for multi-instance deployments.
 * Local subscribers still receive events on this instance; cross-instance
 * delivery uses Redis PUBLISH (SSE connections must subscribe on each node).
 */
export const valkeyRealtimePublisher: RealtimePublisherDriver = {
  subscribe(subscriber) {
    const unsubscribeMemory = memoryRealtimePublisher.subscribe(subscriber);
    const redis = getRedisClient();

    if (!redis) {
      return unsubscribeMemory;
    }

    // Full cross-instance SSE fan-out requires a dedicated Redis subscriber
    // connection per stream. Until that is wired, fall back to in-process delivery.
    return unsubscribeMemory;
  },

  publishToUser(userId, event) {
    memoryRealtimePublisher.publishToUser(userId, event);

    const redis = getRedisClient();

    if (!redis) {
      return;
    }

    void redis.publish(channelForUser(userId), JSON.stringify(event)).catch(() => {
      // Ignore transient pub/sub errors; in-process subscribers already received the event.
    });
  },
};

export function publishToUsersValkey(
  userIds: string[],
  event: RealtimeServerEvent,
): void {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];

  for (const userId of uniqueUserIds) {
    valkeyRealtimePublisher.publishToUser(userId, event);
  }
}

export function subscribeValkeyUserChannel(
  userId: string,
  onEvent: (event: RealtimeServerEvent) => void,
): () => void {
  const subscriber: RealtimeSubscriber = {
    userId,
    send: onEvent,
  };

  return valkeyRealtimePublisher.subscribe(subscriber);
}
