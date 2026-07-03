import type {
  RealtimePublisherDriver,
  RealtimeServerEvent,
  RealtimeSubscriber,
} from "@/server/realtime/publisher/types";

type MemorySubscriber = RealtimeSubscriber;

declare global {
  // eslint-disable-next-line no-var
  var __pakexciseRealtimeSubscribers: Set<MemorySubscriber> | undefined;
}

function getSubscriberStore(): Set<MemorySubscriber> {
  if (!globalThis.__pakexciseRealtimeSubscribers) {
    globalThis.__pakexciseRealtimeSubscribers = new Set();
  }

  return globalThis.__pakexciseRealtimeSubscribers;
}

export const memoryRealtimePublisher: RealtimePublisherDriver = {
  subscribe(subscriber) {
    const store = getSubscriberStore();
    store.add(subscriber);

    return () => {
      store.delete(subscriber);
    };
  },

  publishToUser(userId, event) {
    const store = getSubscriberStore();

    for (const subscriber of store) {
      if (subscriber.userId === userId) {
        subscriber.send(event);
      }
    }
  },
};

export function publishToUsersMemory(
  userIds: string[],
  event: RealtimeServerEvent,
): void {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];

  for (const userId of uniqueUserIds) {
    memoryRealtimePublisher.publishToUser(userId, event);
  }
}
