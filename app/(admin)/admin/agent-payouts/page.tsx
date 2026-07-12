import type { AgentPayoutStatus, AgentReceiptStatus } from "@prisma/client";
import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { AdminPayoutsWorkspace } from "@/features/admin/components/admin-payouts-workspace";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { adminDefaultPageSize } from "@/config/admin";
import { agentRepository } from "@/server/repositories/agent-repository";
export const dynamic = "force-dynamic";

type AdminAgentPayoutsPageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    receipt?: string;
    q?: string;
  }>;
};

const validPayoutStatuses = new Set<string>([
  "PENDING",
  "PROCESSING",
  "PAID",
  "CANCELLED",
]);

const validReceiptStatuses = new Set<string>([
  "AWAITING",
  "RECEIVED",
  "NOT_RECEIVED",
]);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return adminMetadata(t("nav.agentPayouts"));
}

export default async function AdminAgentPayoutsPage({
  searchParams,
}: AdminAgentPayoutsPageProps) {
  const locale = "en";
    const t = await getTranslations("admin");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const search = params.q?.trim() || undefined;
  const statusParam = params.status?.trim();
  const receiptParam = params.receipt?.trim();
  const status =
    statusParam && validPayoutStatuses.has(statusParam)
      ? (statusParam as AgentPayoutStatus)
      : undefined;
  const receiptStatus =
    receiptParam && validReceiptStatuses.has(receiptParam)
      ? (receiptParam as AgentReceiptStatus)
      : undefined;

  const result = await agentRepository.listCommissionsForAdmin({
    page,
    pageSize: adminDefaultPageSize,
    search,
    status,
    receiptStatus,
  });

  const rows = result.items.map((item) => ({
    id: item.id,
    label: item.label,
    amount: item.amount.toString(),
    source: item.source,
    payoutStatus: item.payoutStatus,
    agentReceiptStatus: item.agentReceiptStatus,
    agentDisputeReason: item.agentDisputeReason,
    trackingId: item.application?.trackingId ?? null,
    agentName: item.agentProfile.user.name ?? item.agentProfile.user.email,
    agentEmail: item.agentProfile.user.email,
    hasProof: Boolean(item.proofR2Key),
    agentConfirmedAt: item.agentConfirmedAt?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
  }));

  const labels = {
    columns_agent: t("agents.payouts.columns.agent"),
    columns_label: t("agents.payouts.columns.label"),
    columns_application: t("agents.payouts.columns.application"),
    columns_amount: t("agents.payouts.columns.amount"),
    columns_status: t("agents.payouts.columns.status"),
    columns_source: t("agents.payouts.columns.source"),
    columns_date: t("agents.payouts.columns.date"),
    filters_search: t("agents.payouts.filters.search"),
    filters_searchPlaceholder: t("agents.payouts.filters.searchPlaceholder"),
    filters_status: t("agents.payouts.filters.status"),
    filters_allStatuses: t("agents.payouts.filters.allStatuses"),
    filters_receiptStatus: t("agents.payouts.filters.receiptStatus"),
    filters_allReceiptStatuses: t("agents.payouts.filters.allReceiptStatuses"),
    filters_apply: t("agents.payouts.filters.apply"),
    filters_reset: t("agents.payouts.filters.reset"),
    source_MANUAL: t("agents.payouts.source.MANUAL"),
    source_AUTO_PERCENTAGE: t("agents.payouts.source.AUTO_PERCENTAGE"),
    source_AUTO_FIXED: t("agents.payouts.source.AUTO_FIXED"),
    status_PENDING: t("agents.payouts.status.PENDING"),
    status_PROCESSING: t("agents.payouts.status.PROCESSING"),
    status_PAID: t("agents.payouts.status.PAID"),
    status_CANCELLED: t("agents.payouts.status.CANCELLED"),
    receipt_AWAITING: t("agents.payouts.receipt.AWAITING"),
    receipt_RECEIVED: t("agents.payouts.receipt.RECEIVED"),
    receipt_NOT_RECEIVED: t("agents.payouts.receipt.NOT_RECEIVED"),
    agentConfirmed: t("agents.payouts.agentConfirmed"),
    awaitingConfirm: t("agents.payouts.awaitingConfirm"),
    hasProof: t("agents.payouts.hasProof"),
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("agents.payouts.title")}
        description={t("agents.payouts.description")}
      />

      <AdminPayoutsWorkspace
        rows={rows}
        currentSearch={search}
        currentStatus={status}
        currentReceiptStatus={receiptStatus}
        labels={labels}
      />

      {rows.length === 0 ? (
        <EmptyState
          title={t("agents.payouts.emptyTitle")}
          description={t("agents.payouts.emptyDescription")}
        />
      ) : (
        <PaginationControls
          page={result.page}
          totalPages={result.totalPages}
          basePath="/admin/agent-payouts"
          searchParams={{ q: search, status: statusParam, receipt: receiptParam }}
        />
      )}
    </div>
  );
}
