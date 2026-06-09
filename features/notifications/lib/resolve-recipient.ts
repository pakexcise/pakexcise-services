import "server-only";

import type { NotificationChannel } from "@prisma/client";

import { prisma } from "@/server/db/client";

type ApplicationDraftJson = {
  basic?: {
    email?: string;
    phone?: string;
  };
};

type ResolveRecipientInput = {
  userId: string | null;
  applicationId: string | null;
  channel: NotificationChannel;
};

async function getDraftContact(
  applicationId: string,
): Promise<ApplicationDraftJson["basic"] | null> {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { draftJson: true },
  });

  const draft = application?.draftJson as ApplicationDraftJson | null;
  return draft?.basic ?? null;
}

export async function resolveNotificationRecipient(
  input: ResolveRecipientInput,
): Promise<string | null> {
  if (!input.userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { email: true, phone: true },
  });

  if (!user) {
    return null;
  }

  const draftBasic = input.applicationId
    ? await getDraftContact(input.applicationId)
    : null;

  if (input.channel === "EMAIL") {
    return user.email?.trim() ?? draftBasic?.email?.trim() ?? null;
  }

  return user.phone?.trim() ?? draftBasic?.phone?.trim() ?? null;
}
