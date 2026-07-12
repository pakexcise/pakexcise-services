import "server-only";

import { enqueueNotificationEvent } from "@/features/notifications/queue/enqueue";
import { normalizeNotificationLocale } from "@/features/notifications/lib/resolve-locale";

type QueueInvoiceSentInput = {
  applicationId: string;
  userId: string;
  trackingId: string;
  invoiceNumber: string;
  serviceName: string;
  locale?: string;
  total: string;
  userEmail: string;
  userPhone?: string | null;
};

export async function queueInvoiceSentNotifications(
  input: QueueInvoiceSentInput,
): Promise<void> {
  const locale = normalizeNotificationLocale(input.locale);

  await enqueueNotificationEvent({
    userId: input.userId,
    applicationId: input.applicationId,
    eventType: "INVOICE_SENT",
    locale,
    channels: ["EMAIL", "WHATSAPP"],
    recipientEmail: input.userEmail,
    recipientPhone: input.userPhone,
    payload: {
      trackingId: input.trackingId,
      serviceName: input.serviceName,
      invoiceNumber: input.invoiceNumber,
      total: input.total}});
}
