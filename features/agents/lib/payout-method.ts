import type { PaymentMethodType } from "@prisma/client";

export type AgentPayoutMethodSnapshot = {
  payoutMethodType: PaymentMethodType | null;
  payoutAccountTitle: string | null;
  payoutAccountNumber: string | null;
  payoutIban: string | null;
  payoutBankName: string | null;
  payoutWalletNumber: string | null;
  payoutNotes: string | null;
};

export function isAgentPayoutMethodConfigured(
  profile: AgentPayoutMethodSnapshot,
): boolean {
  return Boolean(profile.payoutMethodType && profile.payoutAccountTitle?.trim());
}

export function toAgentPayoutMethodFormValues(profile: AgentPayoutMethodSnapshot) {
  return {
    payoutMethodType: profile.payoutMethodType ?? ("BANK_TRANSFER" as const),
    payoutAccountTitle: profile.payoutAccountTitle ?? "",
    payoutAccountNumber: profile.payoutAccountNumber ?? "",
    payoutIban: profile.payoutIban ?? "",
    payoutBankName: profile.payoutBankName ?? "",
    payoutWalletNumber: profile.payoutWalletNumber ?? "",
    payoutNotes: profile.payoutNotes ?? "",
  };
}
