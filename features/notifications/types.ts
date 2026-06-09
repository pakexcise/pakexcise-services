import type {
  ApplicationStatus,
  NotificationChannel,
  NotificationEventType,
} from "@prisma/client";

export type NotificationLocale = "en" | "ur";

export type NotificationPayload = {
  trackingId: string;
  serviceName: string;
  serviceNameUr?: string;
  invoiceNumber?: string;
  total?: string;
  toStatus?: ApplicationStatus;
  note?: string;
  reason?: string;
  dashboardPath?: string;
  applicationPath?: string;
};

export type EnqueueNotificationInput = {
  userId: string;
  applicationId: string;
  eventType: NotificationEventType;
  locale: NotificationLocale;
  channels: NotificationChannel[];
  payload: NotificationPayload;
  recipientEmail?: string | null;
  recipientPhone?: string | null;
};

export const MAX_NOTIFICATION_RETRIES = 3;

export const RETRY_BACKOFF_MS = [0, 60_000, 300_000, 900_000] as const;
