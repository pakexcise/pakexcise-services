import "server-only";

import type { ApplicationStatus } from "@prisma/client";

import { prisma } from "@/server/db/client";

type QueueStatusChangeInput = {
  applicationId: string;
  userId: string;
  trackingId: string;
  serviceName: string;
  toStatus: ApplicationStatus;
  note: string;
  userEmail: string;
  userPhone?: string | null;
};

export async function queueApplicationStatusNotifications(
  input: QueueStatusChangeInput,
): Promise<void> {
  const title = `Application status: ${input.toStatus.replace(/_/g, " ").toLowerCase()}`;
  const body = `Your PakExcise application ${input.trackingId} for ${input.serviceName} is now ${input.toStatus.replace(/_/g, " ").toLowerCase()}. ${input.note}`;

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
          type: "application_status_changed",
          trackingId: input.trackingId,
          toStatus: input.toStatus,
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
          type: "application_status_changed",
          trackingId: input.trackingId,
          toStatus: input.toStatus,
          phone: input.userPhone ?? null,
        },
      },
    }),
  ]);
}
