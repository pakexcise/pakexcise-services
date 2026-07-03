import "server-only";

import { memoryRealtimePublisher } from "@/server/realtime/publisher/memory-driver";
import { valkeyRealtimePublisher } from "@/server/realtime/publisher/valkey-driver";
import type {
  RealtimePublisherDriver,
  RealtimeServerEvent,
  RealtimeSubscriber,
} from "@/server/realtime/publisher/types";

export type { RealtimeServerEvent } from "@/server/realtime/publisher/types";

function resolveDriverName(): "memory" | "valkey" {
  const configured = process.env.REALTIME_DRIVER?.trim().toLowerCase();

  if (configured === "valkey" || configured === "redis") {
    return "valkey";
  }

  return "memory";
}

export function getRealtimePublisher(): RealtimePublisherDriver {
  return resolveDriverName() === "valkey"
    ? valkeyRealtimePublisher
    : memoryRealtimePublisher;
}

export function subscribeRealtimeUser(subscriber: RealtimeSubscriber): () => void {
  return getRealtimePublisher().subscribe(subscriber);
}

export function publishRealtimeEventToUser(
  userId: string,
  event: RealtimeServerEvent,
): void {
  getRealtimePublisher().publishToUser(userId, event);
}

export function publishRealtimeEventToUsers(
  userIds: Array<string | null | undefined>,
  event: RealtimeServerEvent,
): void {
  const uniqueUserIds = [...new Set(userIds.filter((id): id is string => Boolean(id)))];

  for (const userId of uniqueUserIds) {
    publishRealtimeEventToUser(userId, event);
  }
}
