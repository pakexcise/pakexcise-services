import "server-only";

import { enqueueNotificationEvent } from "@/features/notifications/queue/enqueue";
import { normalizeNotificationLocale } from "@/features/notifications/lib/resolve-locale";

type QueueApplicationSubmittedInput = {
  applicationId: string;
  userId: string;
  trackingId: string;
  serviceName: string;
  locale?: string;
  userEmail: string;
  userPhone?: string | null;
};

export async function queueApplicationSubmittedNotifications(
  input: QueueApplicationSubmittedInput,
): Promise<void> {
  const locale = normalizeNotificationLocale(input.locale);

  await enqueueNotificationEvent({
    userId: input.userId,
    applicationId: input.applicationId,
    eventType: "APPLICATION_SUBMITTED",
    locale,
    channels: ["EMAIL", "WHATSAPP"],
    recipientEmail: input.userEmail,
    recipientPhone: input.userPhone,
    payload: {
      trackingId: input.trackingId,
      serviceName: input.serviceName}});
}
