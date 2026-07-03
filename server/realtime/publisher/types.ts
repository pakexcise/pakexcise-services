import type { ApplicationStatus } from "@prisma/client";

import type { ApplicationChangeType } from "@/server/realtime/application-events";

export type RealtimeEventType =
  | "heartbeat"
  | "application.updated"
  | "notification.created";

export type RealtimeHeartbeatPayload = {
  type: "heartbeat";
  timestamp: string;
};

export type RealtimeApplicationUpdatedPayload = {
  type: "application.updated";
  applicationId: string;
  trackingId: string;
  status: ApplicationStatus | string;
  changeType: ApplicationChangeType;
  updatedAt: string;
};

export type RealtimeNotificationCreatedPayload = {
  type: "notification.created";
  notificationId: string;
  applicationId: string | null;
  title: string;
  message: string;
  createdAt: string;
  unreadCount: number;
};

export type RealtimeServerEvent =
  | RealtimeHeartbeatPayload
  | RealtimeApplicationUpdatedPayload
  | RealtimeNotificationCreatedPayload;

export type RealtimeSubscriber = {
  userId: string;
  send: (event: RealtimeServerEvent) => void;
};

export type RealtimePublisherDriver = {
  subscribe: (subscriber: RealtimeSubscriber) => () => void;
  publishToUser: (userId: string, event: RealtimeServerEvent) => void;
};
