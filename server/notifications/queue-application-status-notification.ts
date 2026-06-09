import "server-only";

import type { ApplicationStatus } from "@prisma/client";

import { enqueueNotificationEvent } from "@/features/notifications/queue/enqueue";
import { mapStatusToNotificationEvent } from "@/features/notifications/lib/map-status-to-event";
import { normalizeNotificationLocale } from "@/features/notifications/lib/resolve-locale";

type QueueStatusChangeInput = {
  applicationId: string;
  userId: string;
  trackingId: string;
  serviceName: string;
  serviceNameUr?: string;
  locale?: string;
  toStatus: ApplicationStatus;
  note: string;
  userEmail: string;
  userPhone?: string | null;
};

export async function queueApplicationStatusNotifications(
  input: QueueStatusChangeInput,
): Promise<void> {
  const eventType = mapStatusToNotificationEvent(input.toStatus);

  if (!eventType || eventType === "INVOICE_SENT") {
    return;
  }

  const locale = normalizeNotificationLocale(input.locale);

  await enqueueNotificationEvent({
    userId: input.userId,
    applicationId: input.applicationId,
    eventType,
    locale,
    channels: ["EMAIL", "WHATSAPP"],
    recipientEmail: input.userEmail,
    recipientPhone: input.userPhone,
    payload: {
      trackingId: input.trackingId,
      serviceName: input.serviceName,
      serviceNameUr: input.serviceNameUr,
      toStatus: input.toStatus,
      note: input.note,
    },
  });
}
