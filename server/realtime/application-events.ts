import "server-only";

import type { ApplicationStatus, UserRole } from "@prisma/client";

import { getRedisClient } from "@/server/cache/redis-client";
import { prisma } from "@/server/db/client";
import { revalidateApplicationPages } from "@/server/realtime/revalidate-application-pages";

export type ApplicationChangeType =
  | "status"
  | "notes"
  | "invoice"
  | "payment"
  | "document"
  | "submit"
  | "assign";

export type ApplicationRealtimeEvent = {
  applicationId: string;
  userId: string;
  agentId: string | null;
  status: ApplicationStatus | string;
  changeType: ApplicationChangeType;
  updatedAt: number;
};

const EVENTS_KEY = "realtime:application-events";
const VERSION_KEY = "realtime:application-events:version";
const MAX_STORED_EVENTS = 200;
const EVENT_TTL_SECONDS = 60 * 60;

type InMemoryStore = {
  version: number;
  events: ApplicationRealtimeEvent[];
};

declare global {
  // eslint-disable-next-line no-var
  var __pakexciseApplicationEvents: InMemoryStore | undefined;
}

function getInMemoryStore(): InMemoryStore {
  if (!globalThis.__pakexciseApplicationEvents) {
    globalThis.__pakexciseApplicationEvents = {
      version: 0,
      events: [],
    };
  }

  return globalThis.__pakexciseApplicationEvents;
}

function storeInMemory(event: ApplicationRealtimeEvent): void {
  const store = getInMemoryStore();
  store.version = event.updatedAt;
  store.events.push(event);

  if (store.events.length > MAX_STORED_EVENTS) {
    store.events = store.events.slice(-MAX_STORED_EVENTS);
  }
}

async function storeInRedis(event: ApplicationRealtimeEvent): Promise<void> {
  const redis = getRedisClient();

  if (!redis) {
    storeInMemory(event);
    return;
  }

  const payload = JSON.stringify(event);

  await Promise.all([
    redis.zadd(EVENTS_KEY, { score: event.updatedAt, member: payload }),
    redis.set(VERSION_KEY, event.updatedAt, { ex: EVENT_TTL_SECONDS }),
    redis.zremrangebyrank(EVENTS_KEY, 0, -(MAX_STORED_EVENTS + 1)),
  ]);
}

export async function emitApplicationChange(input: {
  applicationId: string;
  status: ApplicationStatus | string;
  changeType: ApplicationChangeType;
  userId?: string;
  agentId?: string | null;
}): Promise<void> {
  let userId = input.userId;
  let agentId = input.agentId ?? null;

  if (!userId) {
    const application = await prisma.application.findUnique({
      where: { id: input.applicationId },
      select: { userId: true, agentId: true },
    });

    if (!application) {
      return;
    }

    userId = application.userId;
    agentId = application.agentId;
  }

  const event: ApplicationRealtimeEvent = {
    applicationId: input.applicationId,
    userId,
    agentId,
    status: input.status,
    changeType: input.changeType,
    updatedAt: Date.now(),
  };

  await storeInRedis(event);
  revalidateApplicationPages(input.applicationId);
}

export async function listApplicationEventsSince(
  since: number,
  viewer: { role: UserRole; userId: string },
  applicationId?: string | null,
): Promise<{ version: number; events: ApplicationRealtimeEvent[] }> {
  const redis = getRedisClient();

  if (!redis) {
    const store = getInMemoryStore();
    const events = store.events.filter(
      (event) =>
        event.updatedAt > since &&
        isEventVisibleToViewer(event, viewer) &&
        matchesApplicationScope(event, applicationId),
    );

    return {
      version: resolveEventsVersion(events, store.version, since),
      events,
    };
  }

  const [versionValue, rawEvents] = await Promise.all([
    redis.get<number>(VERSION_KEY),
    redis.zrange(EVENTS_KEY, since, "+inf", { byScore: true }),
  ]);

  const events = (rawEvents ?? [])
    .map((entry) => {
      if (typeof entry !== "string") {
        return null;
      }

      try {
        return JSON.parse(entry) as ApplicationRealtimeEvent;
      } catch {
        return null;
      }
    })
    .filter((event): event is ApplicationRealtimeEvent => Boolean(event))
    .filter(
      (event) =>
        event.updatedAt > since &&
        isEventVisibleToViewer(event, viewer) &&
        matchesApplicationScope(event, applicationId),
    );

  const storedVersion =
    typeof versionValue === "number" ? versionValue : 0;

  return {
    version: resolveEventsVersion(events, storedVersion, since),
    events,
  };
}

function matchesApplicationScope(
  event: ApplicationRealtimeEvent,
  applicationId?: string | null,
): boolean {
  if (!applicationId) {
    return true;
  }

  return event.applicationId === applicationId;
}

function resolveEventsVersion(
  events: ApplicationRealtimeEvent[],
  storedVersion: number,
  since: number,
): number {
  const latestEventAt = events.reduce(
    (max, event) => Math.max(max, event.updatedAt),
    0,
  );

  return Math.max(storedVersion, latestEventAt, since);
}

function isEventVisibleToViewer(
  event: ApplicationRealtimeEvent,
  viewer: { role: UserRole; userId: string },
): boolean {
  if (
    viewer.role === "ADMIN" ||
    viewer.role === "SUPER_ADMIN" ||
    viewer.role === "SUPPORT"
  ) {
    return true;
  }

  if (viewer.role === "CUSTOMER") {
    return event.userId === viewer.userId;
  }

  if (viewer.role === "AGENT") {
    return event.agentId === viewer.userId || event.userId === viewer.userId;
  }

  return false;
}
