import "server-only";

import type { AppEnv } from "@/config/env.shared";
import type { ActivityEventName } from "@/features/tracking/events";
import { getServerSession, getRequestMeta } from "@/server/auth/session";
import { activityEventRepository } from "@/server/repositories/activity-event-repository";
import { hashIpAddress } from "@/server/security/hash";

export type TrackActivityInput = {
  event: ActivityEventName;
  userId?: string | null;
  sessionId?: string | null;
  path?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, unknown> | null;
};

function resolveTrackingEnvironment(): AppEnv {
  const env = process.env.APP_ENV;

  if (env === "production" || env === "staging" || env === "development") {
    return env;
  }

  return "development";
}

function buildActivityRecord(input: TrackActivityInput) {
  const ipHash = input.ipAddress ? hashIpAddress(input.ipAddress) : null;

  return {
    event: input.event,
    environment: resolveTrackingEnvironment(),
    userId: input.userId ?? null,
    sessionId: input.sessionId ?? null,
    path: input.path ?? null,
    referrer: input.referrer ?? null,
    userAgent: input.userAgent ?? null,
    ipHash,
    metadata: input.metadata ?? null,
  };
}

export function trackActivity(input: TrackActivityInput): void {
  void activityEventRepository
    .create(buildActivityRecord(input))
    .catch(() => {
      // Tracking must never break user flows.
    });
}

export async function trackActivityAwait(input: TrackActivityInput): Promise<void> {
  await activityEventRepository.create(buildActivityRecord(input));
}

export async function trackActivityFromRequest(
  input: Omit<TrackActivityInput, "ipAddress" | "userAgent" | "userId"> & {
    userId?: string | null;
  },
): Promise<void> {
  const [meta, session] = await Promise.all([getRequestMeta(), getServerSession()]);

  trackActivity({
    ...input,
    userId: input.userId ?? session?.user?.id ?? null,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
}
