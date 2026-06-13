import "server-only";

import type { Prisma } from "@prisma/client";

import { getApplicationFacilitationFee } from "@/features/agents/lib/calculate-facilitation-fee";
import { prisma } from "@/server/db/client";

type AutoCommissionProfile = {
  id: string;
  commissionMode: "MANUAL" | "PERCENTAGE" | "FIXED";
  commissionRate: Prisma.Decimal;
  commissionFixedAmount: Prisma.Decimal | null;
};

export async function createAutoCommissionForCompletedApplication(input: {
  applicationId: string;
  trackingId: string;
  agentUserId: string;
}): Promise<{ created: boolean; commissionId?: string }> {
  const agentProfile = await prisma.agentProfile.findUnique({
    where: { userId: input.agentUserId },
    select: {
      id: true,
      commissionMode: true,
      commissionRate: true,
      commissionFixedAmount: true,
    },
  });

  if (!agentProfile || agentProfile.commissionMode === "MANUAL") {
    return { created: false };
  }

  const existing = await prisma.agentCommission.findFirst({
    where: {
      applicationId: input.applicationId,
      source: { in: ["AUTO_PERCENTAGE", "AUTO_FIXED"] },
    },
    select: { id: true },
  });

  if (existing) {
    return { created: false, commissionId: existing.id };
  }

  const amount = await resolveAutoCommissionAmount({
    applicationId: input.applicationId,
    profile: agentProfile,
  });

  if (amount === null || amount <= 0) {
    return { created: false };
  }

  const source =
    agentProfile.commissionMode === "PERCENTAGE"
      ? "AUTO_PERCENTAGE"
      : "AUTO_FIXED";

  const commission = await prisma.agentCommission.create({
    data: {
      agentProfileId: agentProfile.id,
      applicationId: input.applicationId,
      label:
        source === "AUTO_PERCENTAGE"
          ? `Commission ${agentProfile.commissionRate.toString()}%`
          : "Fixed commission",
      description: `Auto commission for completed application ${input.trackingId}`,
      amount,
      source,
      payoutStatus: "PENDING",
    },
  });

  return { created: true, commissionId: commission.id };
}

async function resolveAutoCommissionAmount(input: {
  applicationId: string;
  profile: AutoCommissionProfile;
}): Promise<number | null> {
  if (input.profile.commissionMode === "FIXED") {
    const fixed = input.profile.commissionFixedAmount;

    if (!fixed || Number(fixed) <= 0) {
      return null;
    }

    return Number(fixed);
  }

  if (input.profile.commissionMode === "PERCENTAGE") {
    const rate = Number(input.profile.commissionRate);

    if (rate <= 0) {
      return null;
    }

    const facilitationFee = await getApplicationFacilitationFee(
      input.applicationId,
    );

    if (facilitationFee === null) {
      return null;
    }

    const amount = (facilitationFee * rate) / 100;
    return Math.round(amount * 100) / 100;
  }

  return null;
}
