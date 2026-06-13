"use server";

import { updateAgentPayoutMethodSchema } from "@/features/agents/validators";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { prisma } from "@/server/db/client";
import { requireAgent } from "@/server/permissions/guards";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

export async function updateAgentPayoutMethodAction(
  input: unknown,
): Promise<ActionResult<{ updated: true }>> {
  const user = await requireAgent();
  await enforceRateLimit(serverActionRateLimit, `agent-payout-method:${user.id}`);

  const parsed = parseInput(updateAgentPayoutMethodSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  if (!user.agentProfile) {
    return errorResult("Agent profile not found");
  }

  const walletTypes = new Set([
    "JAZZCASH",
    "EASYPAISA",
    "NAYAPAY",
    "SADAPAY",
  ]);

  if (
    walletTypes.has(parsed.data.payoutMethodType) &&
    !parsed.data.payoutWalletNumber
  ) {
    return errorResult("Wallet number is required for mobile wallet payouts");
  }

  if (
    parsed.data.payoutMethodType === "BANK_TRANSFER" &&
    !parsed.data.payoutAccountNumber &&
    !parsed.data.payoutIban
  ) {
    return errorResult("Account number or IBAN is required for bank transfer");
  }

  await prisma.agentProfile.update({
    where: { id: user.agentProfile.id },
    data: {
      payoutMethodType: parsed.data.payoutMethodType,
      payoutAccountTitle: parsed.data.payoutAccountTitle,
      payoutAccountNumber: parsed.data.payoutAccountNumber ?? null,
      payoutIban: parsed.data.payoutIban ?? null,
      payoutBankName: parsed.data.payoutBankName ?? null,
      payoutWalletNumber: parsed.data.payoutWalletNumber ?? null,
      payoutNotes: parsed.data.payoutNotes ?? null,
    },
  });

  return successResult({ updated: true });
}

export async function clearAgentPayoutMethodAction(): Promise<
  ActionResult<{ cleared: true }>
> {
  const user = await requireAgent();
  await enforceRateLimit(serverActionRateLimit, `agent-payout-clear:${user.id}`);

  if (!user.agentProfile) {
    return errorResult("Agent profile not found");
  }

  await prisma.agentProfile.update({
    where: { id: user.agentProfile.id },
    data: {
      payoutMethodType: null,
      payoutAccountTitle: null,
      payoutAccountNumber: null,
      payoutIban: null,
      payoutBankName: null,
      payoutWalletNumber: null,
      payoutNotes: null,
    },
  });

  return successResult({ cleared: true });
}
