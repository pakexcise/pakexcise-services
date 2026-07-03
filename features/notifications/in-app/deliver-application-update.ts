import "server-only";

import type { ApplicationStatus, NotificationEventType, Prisma } from "@prisma/client";

import { buildNotificationTemplate } from "@/features/notifications/lib/build-template";
import { normalizeNotificationLocale } from "@/features/notifications/lib/resolve-locale";
import type { NotificationPayload } from "@/features/notifications/types";
import { inAppNotificationRepository } from "@/server/repositories/in-app-notification-repository";
import type { ApplicationChangeType } from "@/server/realtime/application-events";
import {
  mapChangeTypeToNotificationEventType,
  publishApplicationUpdatedEvent,
  publishNotificationCreatedEvent,
} from "@/server/realtime/stream-events";

export async function deliverInAppApplicationUpdate(input: {
  applicationId: string;
  customerUserId: string;
  agentId?: string | null;
  trackingId: string;
  locale: string;
  status: string;
  changeType: ApplicationChangeType;
  payload?: Partial<NotificationPayload>;
  recipientUserIds?: string[];
}): Promise<void> {
  const eventType = mapChangeTypeToNotificationEventType(
    input.changeType,
    input.status,
  );

  const payload: NotificationPayload = {
    trackingId: input.trackingId,
    serviceName: input.payload?.serviceName ?? "Application",
    serviceNameUr: input.payload?.serviceNameUr,
    note: input.payload?.note,
    toStatus: input.payload?.toStatus as ApplicationStatus | undefined,
    reason: input.payload?.reason,
    invoiceNumber: input.payload?.invoiceNumber,
  };

  const recipientIds =
    input.recipientUserIds ??
    [input.customerUserId, input.agentId].filter(
      (value): value is string => Boolean(value),
    );

  publishApplicationUpdatedEvent({
    recipientUserIds: recipientIds,
    applicationId: input.applicationId,
    trackingId: input.trackingId,
    status: input.status,
    changeType: input.changeType,
  });

  await Promise.all(
    recipientIds.map(async (recipientUserId) => {
      const template = await buildNotificationTemplate({
        eventType,
        locale: normalizeNotificationLocale(input.locale),
        applicationId: input.applicationId,
        payload,
      });

      const safePayload: Prisma.InputJsonValue = {
        trackingId: input.trackingId,
        changeType: input.changeType,
        status: input.status,
      };

      const notification = await inAppNotificationRepository.create({
        userId: recipientUserId,
        applicationId: input.applicationId,
        eventType,
        locale: input.locale,
        title: template.title,
        body: template.body,
        payloadJson: safePayload,
      });

      const unreadCount = await inAppNotificationRepository.countUnread(
        recipientUserId,
      );

      publishNotificationCreatedEvent({
        recipientUserId,
        notificationId: notification.id,
        applicationId: input.applicationId,
        title: notification.title,
        message: notification.body,
        createdAt: notification.createdAt,
        unreadCount,
      });
    }),
  );
}
