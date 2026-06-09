import "server-only";

import { enqueueNotificationEvent } from "@/features/notifications/queue/enqueue";
import { normalizeNotificationLocale } from "@/features/notifications/lib/resolve-locale";

type QueuePaymentRejectedInput = {
  applicationId: string;
  userId: string;
  trackingId: string;
  serviceName: string;
  serviceNameUr?: string;
  locale?: string;
  reason: string;
  userEmail: string;
  userPhone?: string | null;
};

export async function queuePaymentRejectedNotifications(
  input: QueuePaymentRejectedInput,
): Promise<void> {
  const locale = normalizeNotificationLocale(input.locale);

  await enqueueNotificationEvent({
    userId: input.userId,
    applicationId: input.applicationId,
    eventType: "PAYMENT_REJECTED",
    locale,
    channels: ["EMAIL", "WHATSAPP"],
    recipientEmail: input.userEmail,
    recipientPhone: input.userPhone,
    payload: {
      trackingId: input.trackingId,
      serviceName: input.serviceName,
      serviceNameUr: input.serviceNameUr,
      reason: input.reason,
    },
  });
}

type QueuePaymentUploadedInput = {
  applicationId: string;
  userId: string;
  trackingId: string;
  serviceName: string;
  serviceNameUr?: string;
  locale?: string;
  userEmail: string;
  userPhone?: string | null;
};

export async function queuePaymentUploadedNotifications(
  input: QueuePaymentUploadedInput,
): Promise<void> {
  const locale = normalizeNotificationLocale(input.locale);

  await enqueueNotificationEvent({
    userId: input.userId,
    applicationId: input.applicationId,
    eventType: "PAYMENT_UPLOADED",
    locale,
    channels: ["EMAIL", "WHATSAPP"],
    recipientEmail: input.userEmail,
    recipientPhone: input.userPhone,
    payload: {
      trackingId: input.trackingId,
      serviceName: input.serviceName,
      serviceNameUr: input.serviceNameUr,
    },
  });
}
