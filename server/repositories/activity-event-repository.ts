import "server-only";

import type { Prisma } from "@prisma/client";

import type { ActivityEventName } from "@/features/tracking/events";
import { sanitizeActivityMetadata } from "@/features/tracking/lib/sanitize-metadata";
import { Repository } from "@/server/repositories/base/repository";

export type CreateActivityEventInput = {
  event: ActivityEventName;
  environment: string;
  userId?: string | null;
  sessionId?: string | null;
  path?: string | null;
  referrer?: string | null;
  userAgent?: string | null;
  ipHash?: string | null;
  metadata?: Record<string, unknown> | null;
};

export class ActivityEventRepository extends Repository {
  async create(input: CreateActivityEventInput): Promise<void> {
    const metadata = input.metadata
      ? sanitizeActivityMetadata(input.metadata)
      : null;

    await this.db.activityEvent.create({
      data: {
        event: input.event,
        environment: input.environment,
        userId: input.userId ?? null,
        sessionId: input.sessionId?.slice(0, 128) ?? null,
        path: input.path?.slice(0, 2048) ?? null,
        referrer: input.referrer?.slice(0, 2048) ?? null,
        userAgent: input.userAgent?.slice(0, 512) ?? null,
        ipHash: input.ipHash ?? null,
        metadata:
          metadata && Object.keys(metadata).length > 0
            ? (metadata as Prisma.InputJsonValue)
            : undefined,
      },
    });
  }

  async countByEventSince(event: ActivityEventName, since: Date): Promise<number> {
    return this.db.activityEvent.count({
      where: {
        event,
        environment: "production",
        createdAt: { gte: since },
      },
    });
  }
}

export const activityEventRepository = new ActivityEventRepository();
