import "server-only";

import { prisma } from "@/server/db/client";

type QueuePaymentRejectedInput = {
  applicationId: string;
  userId: string;
  trackingId: string;
  reason: string;
  userEmail: string;
  userPhone?: string | null;
};

export async function queuePaymentRejectedNotifications(
  input: QueuePaymentRejectedInput,
): Promise<void> {
  const title = "Payment screenshot rejected";
  const body = `Your payment proof for application ${input.trackingId} was rejected. Reason: ${input.reason}. Please upload a new screenshot from your dashboard.`;

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
          type: "payment_rejected",
          trackingId: input.trackingId,
          reason: input.reason,
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
          type: "payment_rejected",
          trackingId: input.trackingId,
          reason: input.reason,
          phone: input.userPhone ?? null,
        },
      },
    }),
  ]);
}
