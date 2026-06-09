import "server-only";

import type { NotificationChannel } from "@prisma/client";

import { buildNotificationTemplate } from "@/features/notifications/lib/build-template";
import { hashNotificationRecipient } from "@/features/notifications/lib/recipient-hash";
import { scheduleNotificationDispatch } from "@/features/notifications/queue/schedule";
import type { EnqueueNotificationInput } from "@/features/notifications/types";
import { prisma } from "@/server/db/client";

function channelsForInput(input: EnqueueNotificationInput): NotificationChannel[] {
  const channels = new Set(input.channels);

  if (!input.recipientEmail?.trim()) {
    channels.delete("EMAIL");
  }

  if (!input.recipientPhone?.trim()) {
    channels.delete("WHATSAPP");
    channels.delete("SMS");
  }

  return [...channels];
}

export async function enqueueNotificationEvent(
  input: EnqueueNotificationInput,
): Promise<string[]> {
  const channels = channelsForInput(input);

  if (channels.length === 0) {
    return [];
  }

  const template = await buildNotificationTemplate({
    eventType: input.eventType,
    locale: input.locale,
    applicationId: input.applicationId,
    payload: input.payload,
  });

  const ids: string[] = [];

  await prisma.$transaction(async (tx) => {
    for (const channel of channels) {
      const recipientValue =
        channel === "EMAIL"
          ? input.recipientEmail?.trim()
          : input.recipientPhone?.trim();

      const recipientHash = recipientValue
        ? hashNotificationRecipient(recipientValue)
        : null;

      const created = await tx.notification.create({
        data: {
          userId: input.userId,
          applicationId: input.applicationId,
          channel,
          eventType: input.eventType,
          locale: input.locale,
          status: "PENDING",
          title: template.title,
          body: template.body,
          recipientHash,
          payloadJson: {
            ...input.payload,
            applicationPath: `/${input.locale}/customer/applications/${input.applicationId}`,
          },
        },
      });

      ids.push(created.id);
    }
  });

  await scheduleNotificationDispatch(ids);

  return ids;
}
