import "server-only";

import type { NotificationEventType, Prisma } from "@prisma/client";

import {
  buildAdminInAppNotificationContent,
  shouldNotifyAdminsForChangeType,
} from "@/features/notifications/in-app/admin-content";
import { inAppNotificationRepository } from "@/server/repositories/in-app-notification-repository";
import type { ApplicationChangeType } from "@/server/realtime/application-events";
import { publishNotificationCreatedEvent } from "@/server/realtime/stream-events";
import { prisma } from "@/server/db/client";

export async function deliverAdminPlatformNotification(input: {
  applicationId: string;
  trackingId: string;
  serviceName: string;
  status: string;
  changeType: ApplicationChangeType;
  eventType?: NotificationEventType;
  locale?: string;
}): Promise<void> {
  if (!shouldNotifyAdminsForChangeType(input.changeType)) {
    return;
  }

  const adminUsers = await prisma.user.findMany({
    where: {
      role: { in: ["ADMIN", "SUPER_ADMIN"] },
      deletedAt: null,
    },
    select: { id: true },
  });

  if (adminUsers.length === 0) {
    return;
  }

  const content = buildAdminInAppNotificationContent({
    changeType: input.changeType,
    trackingId: input.trackingId,
    serviceName: input.serviceName,
    status: input.status,
  });

  const payloadJson: Prisma.InputJsonValue = {
    trackingId: input.trackingId,
    changeType: input.changeType,
    status: input.status,
  };

  await Promise.all(
    adminUsers.map(async (admin) => {
      const notification = await inAppNotificationRepository.create({
        userId: admin.id,
        applicationId: input.applicationId,
        eventType: input.eventType ?? "APPLICATION_SUBMITTED",
        locale: input.locale ?? "en",
        title: content.title,
        body: content.body,
        payloadJson,
      });

      const unreadCount = await inAppNotificationRepository.countUnread(admin.id);

      publishNotificationCreatedEvent({
        recipientUserId: admin.id,
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
