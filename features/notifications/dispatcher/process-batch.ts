import "server-only";

import {
  MAX_NOTIFICATION_RETRIES,
  RETRY_BACKOFF_MS,
} from "@/features/notifications/types";
import { processNotificationRecord } from "@/features/notifications/dispatcher/process-notification";
import { prisma } from "@/server/db/client";

export type ProcessBatchResult = {
  processed: number;
  sent: number;
  failed: number;
  retrying: number;
};

function isReadyForRetry(
  retryCount: number,
  updatedAt: Date,
): boolean {
  const backoff =
    RETRY_BACKOFF_MS[Math.min(retryCount, RETRY_BACKOFF_MS.length - 1)] ?? 0;
  const elapsed = Date.now() - updatedAt.getTime();
  return elapsed >= backoff;
}

export async function processPendingNotifications(input?: {
  limit?: number;
}): Promise<ProcessBatchResult> {
  const limit = input?.limit ?? 20;

  const pending = await prisma.notification.findMany({
    where: {
      OR: [
        { status: "PENDING" },
        {
          status: "RETRYING",
          retryCount: { lt: MAX_NOTIFICATION_RETRIES },
        },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  const result: ProcessBatchResult = {
    processed: 0,
    sent: 0,
    failed: 0,
    retrying: 0,
  };

  for (const notification of pending) {
    if (
      notification.status === "RETRYING" &&
      !isReadyForRetry(notification.retryCount, notification.updatedAt)
    ) {
      continue;
    }

    result.processed += 1;

    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: "RETRYING" },
    });

    const outcome = await processNotificationRecord(notification);

    if (outcome.ok) {
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
          failedAt: null,
          lastError: null,
        },
      });
      result.sent += 1;
      continue;
    }

    const nextRetryCount = notification.retryCount + 1;
    const canRetry = outcome.retryable && nextRetryCount < MAX_NOTIFICATION_RETRIES;

    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: canRetry ? "RETRYING" : "FAILED",
        retryCount: nextRetryCount,
        failedAt: canRetry ? null : new Date(),
        lastError: outcome.error.slice(0, 2000),
      },
    });

    if (canRetry) {
      result.retrying += 1;
    } else {
      result.failed += 1;
    }
  }

  return result;
}
