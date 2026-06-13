"use server";

import {
  confirmAgentCommissionReceiptSchema,
  updateAgentCommissionReceiptSchema,
} from "@/features/agents/validators";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { prisma } from "@/server/db/client";
import { requireAgent } from "@/server/permissions/guards";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

async function getPaidCommissionForAgent(commissionId: string, agentProfileId: string) {
  return prisma.agentCommission.findFirst({
    where: {
      id: commissionId,
      agentProfileId,
      payoutStatus: "PAID",
      proofR2Key: { not: null },
    },
    select: {
      id: true,
      agentReceiptStatus: true,
      agentConfirmedAt: true,
    },
  });
}

export async function updateAgentCommissionReceiptAction(
  input: unknown,
): Promise<
  ActionResult<{
    commissionId: string;
    receiptStatus: string;
    confirmedAt: string | null;
  }>
> {
  const user = await requireAgent();
  await enforceRateLimit(serverActionRateLimit, `agent-receipt:${user.id}`);

  const parsed = parseInput(updateAgentCommissionReceiptSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  if (!user.agentProfile) {
    return errorResult("Agent profile not found");
  }

  const commission = await getPaidCommissionForAgent(
    parsed.data.commissionId,
    user.agentProfile.id,
  );

  if (!commission) {
    return errorResult("Paid commission with proof not found");
  }

  const now = new Date();

  const updated =
    parsed.data.status === "RECEIVED"
      ? await prisma.agentCommission.update({
          where: { id: commission.id },
          data: {
            agentReceiptStatus: "RECEIVED",
            agentConfirmedAt: now,
            agentDisputedAt: null,
            agentDisputeReason: null,
            adminResolutionNote: null,
            adminResolvedAt: null,
            adminResolvedById: null,
          },
        })
      : await prisma.agentCommission.update({
          where: { id: commission.id },
          data: {
            agentReceiptStatus: "NOT_RECEIVED",
            agentConfirmedAt: null,
            agentDisputedAt: now,
            agentDisputeReason: parsed.data.reason?.trim() ?? null,
          },
        });

  return successResult({
    commissionId: updated.id,
    receiptStatus: updated.agentReceiptStatus,
    confirmedAt: updated.agentConfirmedAt?.toISOString() ?? null,
  });
}

export async function confirmAgentCommissionReceiptAction(
  input: unknown,
): Promise<ActionResult<{ commissionId: string; confirmedAt: string }>> {
  const parsed = parseInput(confirmAgentCommissionReceiptSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const result = await updateAgentCommissionReceiptAction({
    commissionId: parsed.data.commissionId,
    status: "RECEIVED",
  });

  if (!result.success) {
    return result;
  }

  if (!result.data.confirmedAt) {
    return errorResult("Could not confirm receipt");
  }

  return successResult({
    commissionId: result.data.commissionId,
    confirmedAt: result.data.confirmedAt,
  });
}
