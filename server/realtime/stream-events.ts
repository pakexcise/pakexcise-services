import "server-only";

import type { ApplicationStatus, NotificationEventType } from "@prisma/client";

import type { ApplicationChangeType } from "@/server/realtime/application-events";
import {
  publishRealtimeEventToUsers,
  type RealtimeServerEvent,
} from "@/server/realtime/publisher";

export function publishApplicationUpdatedEvent(input: {
  recipientUserIds: Array<string | null | undefined>;
  applicationId: string;
  trackingId: string;
  status: ApplicationStatus | string;
  changeType: ApplicationChangeType;
  updatedAt?: Date;
}): void {
  const event: RealtimeServerEvent = {
    type: "application.updated",
    applicationId: input.applicationId,
    trackingId: input.trackingId,
    status: input.status,
    changeType: input.changeType,
    updatedAt: (input.updatedAt ?? new Date()).toISOString(),
  };

  publishRealtimeEventToUsers(input.recipientUserIds, event);
}

export function publishNotificationCreatedEvent(input: {
  recipientUserId: string;
  notificationId: string;
  applicationId: string | null;
  title: string;
  message: string;
  createdAt: Date;
  unreadCount: number;
}): void {
  const event: RealtimeServerEvent = {
    type: "notification.created",
    notificationId: input.notificationId,
    applicationId: input.applicationId,
    title: input.title,
    message: input.message,
    createdAt: input.createdAt.toISOString(),
    unreadCount: input.unreadCount,
  };

  publishRealtimeEventToUsers([input.recipientUserId], event);
}

export function mapChangeTypeToNotificationEventType(
  changeType: ApplicationChangeType,
  status: ApplicationStatus | string,
): NotificationEventType {
  switch (changeType) {
    case "invoice":
      return "INVOICE_SENT";
    case "payment":
      if (status === "PAYMENT_VERIFIED") {
        return "PAYMENT_VERIFIED";
      }

      if (status === "INVOICE_SENT") {
        return "PAYMENT_REJECTED";
      }

      return "PAYMENT_UPLOADED";
    case "document":
      return "DOCS_REQUIRED";
    case "submit":
      return "APPLICATION_SUBMITTED";
    case "assign":
      return "STATUS_CHANGED";
    case "status":
      if (status === "COMPLETED") {
        return "APPLICATION_COMPLETED";
      }

      if (status === "REJECTED") {
        return "APPLICATION_REJECTED";
      }

      if (status === "CANCELLED") {
        return "APPLICATION_CANCELLED";
      }

      if (status === "DOCS_REQUIRED") {
        return "DOCS_REQUIRED";
      }

      return "STATUS_CHANGED";
    default:
      return "STATUS_CHANGED";
  }
}
