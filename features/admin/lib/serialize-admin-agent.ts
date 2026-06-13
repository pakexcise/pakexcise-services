import type {
  AgentApprovalStatus,
  AgentCommissionMode,
  AgentCommissionSource,
  AgentPayoutStatus,
  PaymentMethodType,
} from "@prisma/client";

import type {
  AdminAgentListItem,
  AgentCommissionListItem,
} from "@/server/repositories/agent-repository";

export type AdminAgentWorkspaceApplication = {
  id: string;
  trackingId: string;
  status: string;
  createdAt: string;
  serviceNameEn: string;
  serviceNameUr: string;
};

export type AdminAgentWorkspaceCommission = {
  id: string;
  label: string;
  description: string | null;
  amount: string;
  source: AgentCommissionSource;
  payoutStatus: AgentPayoutStatus;
  trackingId: string | null;
  hasProof: boolean;
  paidAt: string | null;
  agentConfirmedAt: string | null;
  agentReceiptStatus: string;
  agentDisputeReason: string | null;
  createdAt: string;
};

export type AdminAgentWorkspaceItem = {
  id: string;
  approvalStatus: AgentApprovalStatus;
  commissionMode: AgentCommissionMode;
  commissionRate: string;
  commissionFixedAmount: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  applicationCount: number;
  commissionCount: number;
  payoutMethod: {
    type: PaymentMethodType | null;
    accountTitle: string | null;
    accountNumber: string | null;
    iban: string | null;
    bankName: string | null;
    walletNumber: string | null;
    notes: string | null;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    status: string;
    displayEmail: string;
    displayPhone: string | null;
  };
  recentApplications: AdminAgentWorkspaceApplication[];
  commissions: AdminAgentWorkspaceCommission[];
};

function serializeCommission(
  commission: AgentCommissionListItem,
): AdminAgentWorkspaceCommission {
  return {
    id: commission.id,
    label: commission.label,
    description: commission.description,
    amount: commission.amount.toString(),
    source: commission.source,
    payoutStatus: commission.payoutStatus,
    trackingId: commission.application?.trackingId ?? null,
    hasProof: Boolean(commission.proofR2Key),
    paidAt: commission.paidAt?.toISOString() ?? null,
    agentConfirmedAt: commission.agentConfirmedAt?.toISOString() ?? null,
    agentReceiptStatus: commission.agentReceiptStatus,
    agentDisputeReason: commission.agentDisputeReason,
    createdAt: commission.createdAt.toISOString(),
  };
}

export function serializeAdminAgentForWorkspace(input: {
  agent: AdminAgentListItem;
  applicationCount: number;
  recentApplications: Array<{
    id: string;
    trackingId: string;
    status: string;
    createdAt: Date;
    service: { nameEn: string; nameUr: string };
  }>;
  commissions: AgentCommissionListItem[];
  displayEmail: string;
  displayPhone: string | null;
}): AdminAgentWorkspaceItem {
  const serializedCommissions = input.commissions.map(serializeCommission);

  return {
    id: input.agent.id,
    approvalStatus: input.agent.approvalStatus,
    commissionMode: input.agent.commissionMode,
    commissionRate: input.agent.commissionRate.toString(),
    commissionFixedAmount: input.agent.commissionFixedAmount?.toString() ?? null,
    notes: input.agent.notes,
    isActive: input.agent.isActive,
    createdAt: input.agent.createdAt.toISOString(),
    applicationCount: input.applicationCount,
    commissionCount: serializedCommissions.length,
    payoutMethod: {
      type: input.agent.payoutMethodType,
      accountTitle: input.agent.payoutAccountTitle,
      accountNumber: input.agent.payoutAccountNumber,
      iban: input.agent.payoutIban,
      bankName: input.agent.payoutBankName,
      walletNumber: input.agent.payoutWalletNumber,
      notes: input.agent.payoutNotes,
    },
    user: {
      id: input.agent.user.id,
      name: input.agent.user.name,
      email: input.agent.user.email,
      phone: input.agent.user.phone,
      status: input.agent.user.status,
      displayEmail: input.displayEmail,
      displayPhone: input.displayPhone,
    },
    recentApplications: input.recentApplications.map((application) => ({
      id: application.id,
      trackingId: application.trackingId,
      status: application.status,
      createdAt: application.createdAt.toISOString(),
      serviceNameEn: application.service.nameEn,
      serviceNameUr: application.service.nameUr,
    })),
    commissions: serializedCommissions,
  };
}
