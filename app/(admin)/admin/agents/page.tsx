import type { AgentApprovalStatus } from "@prisma/client";
import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AdminAgentsWorkspace } from "@/features/admin/components/admin-agents-workspace";
import { AgentAdminStats } from "@/features/admin/components/agent-admin-stats";
import { AgentFilters } from "@/features/admin/components/agent-filters";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { serializeAdminAgentForWorkspace } from "@/features/admin/lib/serialize-admin-agent";
import {
  formatAdminCustomerEmailDisplay,
  formatAdminCustomerPhoneDisplay,
} from "@/features/admin/lib/format-customer-identity";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { adminDefaultPageSize } from "@/config/admin";
import { agentApplicationRepository } from "@/server/repositories/agent-application-repository";
import { agentRepository } from "@/server/repositories/agent-repository";
export const dynamic = "force-dynamic";

type AdminAgentsPageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    q?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return adminMetadata(t("nav.agents"));
}

export default async function AdminAgentsPage({
  searchParams,
}: AdminAgentsPageProps) {
  const locale = "en";
    const t = await getTranslations("admin");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const search = params.q?.trim() || undefined;
  const statusParam = params.status?.trim();
  const status =
    statusParam === "PENDING" ||
    statusParam === "APPROVED" ||
    statusParam === "REJECTED"
      ? statusParam
      : undefined;

  const [result, stats] = await Promise.all([
    agentRepository.listForAdmin({
      page,
      pageSize: adminDefaultPageSize,
      search,
      status,
    }),
    agentRepository.getAdminStats(),
  ]);

  const applicationCounts = await agentRepository.countApplicationsByAgentUserIds(
    result.items.map((agent) => agent.user.id),
  );

  const commissionsByAgent = await agentRepository.listCommissionsByAgentProfileIds(
    result.items.map((agent) => agent.id),
  );

  const agents = await Promise.all(
    result.items.map(async (agent) => {
      const recentApplications =
        await agentApplicationRepository.listByAgentForAdmin(agent.user.id, 5);

      return serializeAdminAgentForWorkspace({
        agent,
        applicationCount: applicationCounts[agent.user.id] ?? 0,
        recentApplications,
        commissions: commissionsByAgent[agent.id] ?? [],
        displayEmail: formatAdminCustomerEmailDisplay({
          email: agent.user.email,
          phone: agent.user.phone,
        }),
        displayPhone: formatAdminCustomerPhoneDisplay({
          phone: agent.user.phone,
        }),
      });
    }),
  );

  const filterParams = {
    q: search,
    status: statusParam,
  };

  const workspaceLabels = {
    columns: {
      agent: t("agents.columns.agent"),
      contact: t("agents.columns.contact"),
      approval: t("agents.columns.approval"),
      account: t("agents.columns.account"),
      commission: t("agents.columns.commission"),
      applications: t("agents.columns.applications"),
      commissions: t("agents.columns.commissions"),
      actions: t("agents.columns.actions"),
    },
    approvalStatus: {
      PENDING: t("agents.approvalStatus.PENDING"),
      APPROVED: t("agents.approvalStatus.APPROVED"),
      REJECTED: t("agents.approvalStatus.REJECTED"),
    } satisfies Record<AgentApprovalStatus, string>,
    active: t("agents.active"),
    inactive: t("agents.inactive"),
    manage: t("agents.manage"),
    commissionFixedPrefix: t("agents.commissionFixedPrefix"),
    commissionManual: t("agents.commissionManualDisplay"),
    sheetTitle: t("agents.sheetTitle"),
    sheetDescription: t("agents.sheetDescription"),
    viewApplications: t("agents.viewApplications"),
    recentApplications: t("agents.recentApplications"),
    trackingId: t("agents.columns.trackingId"),
    service: t("agents.columns.service"),
    status: t("agents.columns.status"),
    created: t("agents.columns.created"),
    noRecentApplications: t("agents.noRecentApplications"),
    managePanel: {
      approve: t("agents.actions.approve"),
      approving: t("agents.actions.approving"),
      reject: t("agents.actions.reject"),
      rejecting: t("agents.actions.rejecting"),
      rejectNotes: t("agents.actions.rejectNotes"),
      commissionRate: t("agents.commissionRate"),
      updateRate: t("agents.actions.updateRate"),
      updatingRate: t("agents.actions.updatingRate"),
      toggleActive: t("agents.actions.activate"),
      toggleInactive: t("agents.actions.deactivate"),
      toggling: t("agents.actions.toggling"),
      addCommission: t("agents.actions.addCommission"),
      commissionLabel: t("agents.actions.commissionLabel"),
      commissionAmount: t("agents.actions.commissionAmount"),
      commissionDescription: t("agents.actions.commissionDescription"),
      addingCommission: t("agents.actions.addingCommission"),
      success: t("agents.actions.success"),
      error: t("agents.actions.error"),
      approvalSection: t("agents.actions.approvalSection"),
      accountSection: t("agents.actions.accountSection"),
      commissionSection: t("agents.actions.commissionSection"),
      commissionHelp: t("agents.actions.commissionHelp"),
      commissionMode: t("agents.actions.commissionMode"),
      commissionMode_MANUAL: t("agents.actions.commissionModeManual"),
      commissionMode_PERCENTAGE: t("agents.actions.commissionModePercentage"),
      commissionMode_FIXED: t("agents.actions.commissionModeFixed"),
      fixedAmount: t("agents.actions.fixedAmount"),
      saveManualMode: t("agents.actions.saveManualMode"),
      payoutMethodSection: t("agents.actions.payoutMethodSection"),
      payoutMethodType: t("agents.actions.payoutMethodType"),
      payoutAccountTitle: t("agents.actions.payoutAccountTitle"),
      payoutAccountNumber: t("agents.actions.payoutAccountNumber"),
      payoutIban: t("agents.actions.payoutIban"),
      payoutBankName: t("agents.actions.payoutBankName"),
      payoutWalletNumber: t("agents.actions.payoutWalletNumber"),
      payoutNotes: t("agents.actions.payoutNotes"),
      payoutMethodMissing: t("agents.actions.payoutMethodMissing"),
    },
    ledgerLabels: {
      title: t("agents.actions.commissionsLedger"),
      empty: t("agents.actions.noCommissions"),
      addPayout: t("agents.actions.showPayoutForm"),
      hidePayoutForm: t("agents.actions.hidePayoutForm"),
      trackingId: t("agents.columns.trackingId"),
      label: t("agents.actions.commissionLabel"),
      amount: t("agents.actions.commissionAmount"),
      description: t("agents.actions.commissionDescription"),
      addCommission: t("agents.actions.addCommission"),
      addingCommission: t("agents.actions.addingCommission"),
      edit: t("agents.ledger.edit"),
      save: t("agents.ledger.save"),
      saving: t("agents.ledger.saving"),
      cancelEdit: t("agents.ledger.cancelEdit"),
      cancelPayout: t("agents.ledger.cancelPayout"),
      cancelling: t("agents.ledger.cancelling"),
      cancelConfirm: t("agents.ledger.cancelConfirm"),
      cancelConfirmButton: t("agents.ledger.cancelConfirmButton"),
      cancelDismiss: t("agents.ledger.cancelDismiss"),
      markPaid: t("agents.actions.markPaid"),
      markPaidShort: t("agents.ledger.markPaidShort"),
      markPaidUploading: t("agents.ledger.markPaidUploading"),
      markPaidRequiresPayout: t("agents.ledger.markPaidRequiresPayout"),
      completePayout: t("agents.ledger.completePayout"),
      completingPayout: t("agents.ledger.completingPayout"),
      reuploadProof: t("agents.ledger.reuploadProof"),
      resolveDispute: t("agents.ledger.resolveDispute"),
      resolvingDispute: t("agents.ledger.resolvingDispute"),
      resolutionNote: t("agents.ledger.resolutionNote"),
      resolutionNotePlaceholder: t("agents.ledger.resolutionNotePlaceholder"),
      resolutionNoteRequired: t("agents.ledger.resolutionNoteRequired"),
      cancelResolve: t("agents.ledger.cancelResolve"),
      uploadNewProof: t("agents.ledger.uploadNewProof"),
      noTrackingId: t("agents.ledger.noTrackingId"),
      payoutMethodMissing: t("agents.actions.payoutMethodMissing"),
      receipt_RECEIVED: t("agents.ledger.receipt_RECEIVED"),
      receipt_NOT_RECEIVED: t("agents.ledger.receipt_NOT_RECEIVED"),
      receipt_AWAITING: t("agents.ledger.receipt_AWAITING"),
      viewProof: t("agents.actions.viewProof"),
      hideProof: t("agents.actions.hideProof"),
      locked: t("agents.ledger.locked"),
      filterAll: t("agents.ledger.filterAll"),
      filterPending: t("agents.ledger.filterPending"),
      filterPaid: t("agents.ledger.filterPaid"),
      filterCancelled: t("agents.ledger.filterCancelled"),
      summaryPending: t("agents.ledger.summaryPending"),
      summaryPaid: t("agents.ledger.summaryPaid"),
      success: t("agents.ledger.success"),
      error: t("agents.ledger.error"),
      invalidProof: t("agents.actions.invalidProof"),
      uploadFailed: t("agents.actions.uploadFailed"),
      proofLoading: t("agents.actions.proofLoading"),
      proofError: t("agents.actions.proofError"),
      proofRetry: t("agents.actions.proofRetry"),
      proofOpen: t("agents.actions.proofOpen"),
      proofUnsupported: t("agents.actions.proofUnsupported"),
      agentConfirmed: t("agents.actions.agentConfirmed"),
      awaitingAgentConfirm: t("agents.actions.awaitingAgentConfirm"),
      columns: {
        label: t("agents.payouts.columns.label"),
        application: t("agents.payouts.columns.application"),
        amount: t("agents.payouts.columns.amount"),
        status: t("agents.payouts.columns.status"),
        actions: t("agents.payouts.columns.actions"),
      },
      source_MANUAL: t("agents.payouts.source.MANUAL"),
      source_AUTO_PERCENTAGE: t("agents.payouts.source.AUTO_PERCENTAGE"),
      source_AUTO_FIXED: t("agents.payouts.source.AUTO_FIXED"),
      payoutStatus_PENDING: t("agents.payouts.status.PENDING"),
      payoutStatus_PROCESSING: t("agents.payouts.status.PROCESSING"),
      payoutStatus_PAID: t("agents.payouts.status.PAID"),
      payoutStatus_CANCELLED: t("agents.payouts.status.CANCELLED"),
    },
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("agents.title")}
        description={t("agents.description")}
      />

      <AgentAdminStats stats={stats} currentStatus={statusParam} />

      <AgentFilters currentSearch={search} currentStatus={status} />

      {agents.length === 0 ? (
        <EmptyState
          title={t("agents.emptyTitle")}
          description={t("agents.emptyDescription")}
        />
      ) : (
        <>
          <AdminAgentsWorkspace
            agents={agents}
            locale={locale}
            labels={workspaceLabels}
          />

          <PaginationControls
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/agents"
            searchParams={filterParams}
          />
        </>
      )}
    </div>
  );
}
