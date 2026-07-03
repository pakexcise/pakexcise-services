import type { ApplicationStatus } from "@prisma/client";

import type { ApplicationChangeType } from "@/server/realtime/application-events";

export type RealtimeApplicationUpdatedEvent = {
  type: "application.updated";
  applicationId: string;
  trackingId: string;
  status: ApplicationStatus | string;
  changeType: ApplicationChangeType;
  updatedAt: string;
};

export type RealtimeNotificationCreatedEvent = {
  type: "notification.created";
  notificationId: string;
  applicationId: string | null;
  title: string;
  message: string;
  createdAt: string;
  unreadCount: number;
};

export type RealtimeHeartbeatEvent = {
  type: "heartbeat";
  timestamp: string;
};

export type RealtimeClientEvent =
  | RealtimeApplicationUpdatedEvent
  | RealtimeNotificationCreatedEvent
  | RealtimeHeartbeatEvent;

export type InAppNotificationListItem = {
  id: string;
  applicationId: string | null;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  trackingId: string | null;
};

export type ApplicationStatusSnapshot = {
  applicationId: string;
  trackingId: string;
  status: ApplicationStatus | string;
  updatedAt: string;
  nextAction: string | null;
  statusHistory: Array<{
    id: string;
    fromStatus: ApplicationStatus | null;
    toStatus: ApplicationStatus;
    createdAt: string;
  }>;
};

export type ApplicationRealtimeListener = (
  event: RealtimeApplicationUpdatedEvent,
) => void;
