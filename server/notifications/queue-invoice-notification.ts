import "server-only";

import { prisma } from "@/server/db/client";

type QueueInvoiceSentInput = {
  applicationId: string;
  userId: string;
  trackingId: string;
  invoiceNumber: string;
  serviceName: string;
  total: string;
  userEmail: string;
  userPhone?: string | null;
};

export async function queueInvoiceSentNotifications(
  input: QueueInvoiceSentInput,
): Promise<void> {
  const title = "Invoice sent";
  const body = `Your PakExcise invoice ${input.invoiceNumber} for application ${input.trackingId} is ready. Total due: ${input.total}. Please review the invoice in your dashboard and upload payment proof.`;

  await prisma.$transaction([
    prisma.notification.create({
      data: {
        userId: input.userId,
        applicationId: input.applicationId,
        channel: "EMAIL",
        status: "PENDING",
        title,
        body,
        payloadJson: {
          type: "invoice_sent",
          trackingId: input.trackingId,
          invoiceNumber: input.invoiceNumber,
          toEmail: input.userEmail,
        },
      },
    }),
    prisma.notification.create({
      data: {
        userId: input.userId,
        applicationId: input.applicationId,
        channel: "WHATSAPP",
        status: "PENDING",
        title,
        body,
        payloadJson: {
          type: "invoice_sent",
          trackingId: input.trackingId,
          invoiceNumber: input.invoiceNumber,
          phone: input.userPhone ?? null,
        },
      },
    }),
  ]);
}
