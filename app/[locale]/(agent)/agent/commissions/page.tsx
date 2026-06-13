import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

import { AgentCommissionsWorkspace } from "@/components/agent/agent-commissions-workspace";
import { isApprovedActiveAgent } from "@/features/agents/lib/is-approved-agent";
import {
  isAgentPayoutMethodConfigured,
  toAgentPayoutMethodFormValues,
} from "@/features/agents/lib/payout-method";
import { getCurrentUser } from "@/server/auth/current-user";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { agentRepository } from "@/server/repositories/agent-repository";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("agent.commissions");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function AgentCommissionsPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const user = await getCurrentUser();

  if (!user || !isApprovedActiveAgent(user) || !user.agentProfile) {
    redirect({ href: "/agent/dashboard", locale });
    return;
  }

  const agentProfile = user.agentProfile;
  const t = await getTranslations("agent.commissions");
  const tPayout = await getTranslations("agent.profile.payoutMethod");

  const commissions = await agentRepository.listCommissionsForAgent(agentProfile.id);

  const rows = commissions.map((commission) => ({
    id: commission.id,
    label: commission.label,
    description: commission.description,
    amount: commission.amount.toString(),
    source: commission.source,
    payoutStatus: commission.payoutStatus,
    trackingId: commission.application?.trackingId ?? null,
    hasProof: Boolean(commission.proofR2Key),
    agentReceiptStatus: commission.agentReceiptStatus,
    agentConfirmedAt: commission.agentConfirmedAt?.toISOString() ?? null,
    agentDisputeReason: commission.agentDisputeReason,
    adminResolutionNote: commission.adminResolutionNote,
    paidAt: commission.paidAt?.toISOString() ?? null,
    createdAt: commission.createdAt.toISOString(),
  }));

  const commissionSummary =
    agentProfile.commissionMode === "PERCENTAGE"
      ? t("summaryPercentage", {
          rate: agentProfile.commissionRate.toString(),
        })
      : agentProfile.commissionMode === "FIXED"
        ? t("summaryFixed", {
            amount: agentProfile.commissionFixedAmount?.toString() ?? "0",
          })
        : t("summaryManual");

  const payoutMethod = toAgentPayoutMethodFormValues(agentProfile);
  const hasPayoutMethod = isAgentPayoutMethodConfigured(agentProfile);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <AgentCommissionsWorkspace
        commissions={rows}
        commissionSummary={commissionSummary}
        locale={locale}
        payoutMethod={payoutMethod}
        hasPayoutMethod={hasPayoutMethod}
        labels={{
          empty: t("empty"),
          filterAll: t("filters.all"),
          filterPending: t("filters.pending"),
          filterPaid: t("filters.paid"),
          filterCancelled: t("filters.cancelled"),
          summaryPending: t("summary.pending"),
          summaryPaid: t("summary.paid"),
          summaryAwaiting: t("summary.awaiting"),
          noTrackingId: t("noTrackingId"),
          viewProof: t("viewProof"),
          hideProof: t("hideProof"),
          confirmReceipt: t("confirmReceipt"),
          notReceived: t("notReceived"),
          changeReceipt: t("changeReceipt"),
          disputeReason: t("disputeReason"),
          disputePlaceholder: t("disputePlaceholder"),
          adminResponse: t("adminResponse"),
          submitDispute: t("submitDispute"),
          cancelDispute: t("cancelDispute"),
          confirming: t("confirming"),
          disputing: t("disputing"),
          confirmError: t("confirmError"),
          receiptReceived: t("receiptStatus.RECEIVED"),
          receiptNotReceived: t("receiptStatus.NOT_RECEIVED"),
          receiptAwaiting: t("receiptStatus.AWAITING"),
          paidOn: t("paidOn"),
          footer: t("payoutPlaceholder"),
          proofLoading: t("proof.loading"),
          proofError: t("proof.error"),
          proofRetry: t("proof.retry"),
          proofOpen: t("proof.openNewTab"),
          proofUnsupported: t("proof.unsupported"),
          source_MANUAL: t("source.MANUAL"),
          source_AUTO_PERCENTAGE: t("source.AUTO_PERCENTAGE"),
          source_AUTO_FIXED: t("source.AUTO_FIXED"),
          status_PENDING: t("payoutStatus.PENDING"),
          status_PROCESSING: t("payoutStatus.PROCESSING"),
          status_PAID: t("payoutStatus.PAID"),
          status_CANCELLED: t("payoutStatus.CANCELLED"),
        }}
        payoutMethodLabels={{
          title: tPayout("title"),
          description: tPayout("description"),
          emptyTitle: tPayout("emptyTitle"),
          emptyDescription: tPayout("emptyDescription"),
          addMethod: tPayout("addMethod"),
          editMethod: tPayout("editMethod"),
          deleteMethod: tPayout("deleteMethod"),
          deleteConfirm: tPayout("deleteConfirm"),
          deleteConfirmButton: tPayout("deleteConfirmButton"),
          deleteDismiss: tPayout("deleteDismiss"),
          deleting: tPayout("deleting"),
          deleted: tPayout("deleted"),
          methodType: tPayout("methodType"),
          accountTitle: tPayout("accountTitle"),
          accountNumber: tPayout("accountNumber"),
          iban: tPayout("iban"),
          bankName: tPayout("bankName"),
          walletNumber: tPayout("walletNumber"),
          notes: tPayout("notes"),
          save: tPayout("save"),
          saving: tPayout("saving"),
          saved: tPayout("saved"),
          error: tPayout("error"),
          cancel: tPayout("cancel"),
          configured: tPayout("configured"),
          method_BANK_TRANSFER: tPayout("types.BANK_TRANSFER"),
          method_JAZZCASH: tPayout("types.JAZZCASH"),
          method_EASYPAISA: tPayout("types.EASYPAISA"),
          method_NAYAPAY: tPayout("types.NAYAPAY"),
          method_SADAPAY: tPayout("types.SADAPAY"),
          method_OTHER: tPayout("types.OTHER"),
        }}
      />
    </div>
  );
}
