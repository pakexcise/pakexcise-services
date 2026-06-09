import "server-only";

import { prisma } from "@/server/db/client";

type QueueApplicationSubmittedInput = {
  applicationId: string;
  userId: string;
  trackingId: string;
  serviceName: string;
  userEmail: string;
  userPhone?: string | null;
};

export async function queueApplicationSubmittedNotifications(
  input: QueueApplicationSubmittedInput,
): Promise<void> {
  const title = "Application submitted";
  const body = `Your PakExcise application ${input.trackingId} for ${input.serviceName} has been submitted. We will review it shortly.`;

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
          type: "application_submitted",
          trackingId: input.trackingId,
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
          type: "application_submitted",
          trackingId: input.trackingId,
          phone: input.userPhone ?? null,
        },
      },
    }),
  ]);
}
