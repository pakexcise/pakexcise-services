"use server";

import { headers } from "next/headers";
import { z } from "zod";

import {
  CLIENT_ACTIVITY_EVENTS,
  type ClientActivityEventName,
} from "@/features/tracking/events";
import { getServerSession, getRequestMetaFromHeaders } from "@/server/auth/session";
import { trackActivity } from "@/server/tracking/track-activity";
import {
  activityEventRateLimit,
  enforceRateLimit,
} from "@/server/security/rate-limit";
import {
  isLikelyBotUserAgent,
  isPublicAnalyticsPath,
} from "@/features/tracking/lib/public-analytics-path";

const metadataSchema = z.record(
  z.union([z.string().max(500), z.number(), z.boolean()]),
);

const recordActivitySchema = z.object({
  event: z.enum(CLIENT_ACTIVITY_EVENTS),
  sessionId: z.string().min(8).max(128).optional(),
  path: z.string().max(2048).optional(),
  referrer: z.string().max(2048).optional(),
  metadata: metadataSchema.optional(),
});

export type RecordActivityInput = {
  event: ClientActivityEventName;
  sessionId?: string;
  path?: string;
  referrer?: string;
  metadata?: Record<string, string | number | boolean>;
};

export async function recordActivity(
  input: RecordActivityInput,
): Promise<{ ok: true } | { ok: false }> {
  const parsed = recordActivitySchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false };
  }

  const headerStore = await headers();
  const meta = getRequestMetaFromHeaders(headerStore);

  if (isLikelyBotUserAgent(meta.userAgent)) {
    return { ok: true };
  }

  // Drop internal shell page views server-side (defense in depth).
  if (
    parsed.data.event === "page_view" &&
    !isPublicAnalyticsPath(parsed.data.path)
  ) {
    return { ok: true };
  }

  const rateLimitKey =
    parsed.data.sessionId ?? meta.ipAddress ?? "anonymous";

  try {
    await enforceRateLimit(activityEventRateLimit, `activity:${rateLimitKey}`);
  } catch {
    return { ok: false };
  }

  const session = await getServerSession();

  trackActivity({
    event: parsed.data.event,
    userId: session?.user?.id ?? null,
    sessionId: parsed.data.sessionId ?? null,
    path: parsed.data.path ?? null,
    referrer: parsed.data.referrer ?? null,
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
    metadata: parsed.data.metadata ?? null,
  });

  return { ok: true };
}
