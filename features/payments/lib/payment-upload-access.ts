import "server-only";

import type { Application } from "@prisma/client";
import type { CurrentUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db/client";

function canUploadPaymentProof(
  user: CurrentUser,
  application: Pick<Application, "userId" | "agentId">,
): boolean {
  if (user.role === "AGENT") {
    const profile = user.agentProfile;

    return (
      application.agentId === user.id &&
      Boolean(profile?.isActive) &&
      profile?.approvalStatus !== "REJECTED"
    );
  }

  if (user.role === "CUSTOMER") {
    return application.userId === user.id;
  }

  return false;
}

const paymentUploadInclude = {
  application: {
    select: {
      id: true,
      status: true,
      trackingId: true,
      userId: true,
      agentId: true,
      locale: true,
      service: { select: { nameEn: true, nameUr: true } },
      user: { select: { email: true, phone: true } },
    },
  },
  invoice: { select: { status: true } },
} as const;

const paymentUploadSelect = {
  id: true,
  applicationId: true,
  status: true,
  screenshotR2Key: true,
  screenshotMimeType: true,
  screenshotFileSize: true,
  screenshotFileName: true,
} as const;

export type PaymentForUploadAccess = NonNullable<
  Awaited<ReturnType<typeof getPaymentForUploadAccess>>
>;

export async function getPaymentForUploadAccess(
  paymentId: string,
  user: CurrentUser,
) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      ...paymentUploadSelect,
      application: paymentUploadInclude.application,
      invoice: paymentUploadInclude.invoice,
    },
  });

  if (!payment || !canUploadPaymentProof(user, payment.application)) {
    return null;
  }

  return payment;
}
