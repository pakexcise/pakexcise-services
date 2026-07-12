import Link from "next/link";
import type { ApplicationStatus } from "@prisma/client";
import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";
import { Plus } from "lucide-react";

import { ApplicationFilters } from "@/features/admin/components/application-filters";
import { ApplicationQueueStats } from "@/features/admin/components/application-queue-stats";
import { ApplicationsBulkSelectTable } from "@/features/admin/components/applications-bulk-select-table";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { getAdminApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { adminDefaultPageSize } from "@/config/admin";
import { Button } from "@/components/ui/button";
import { applicationRepository } from "@/server/repositories/application-repository";
import { requireAdminPortal } from "@/server/permissions/guards";
import { isSuperAdminRole } from "@/server/permissions/admin-scope";
import {
  getApplicationSubmissionSourceLabelKey,
  resolveApplicationSubmissionSource,
} from "@/features/applications/lib/resolve-submission-source";

const validStatuses = new Set<string>([
  "SUBMITTED",
  "REVIEW",
  "DOCS_REQUIRED",
  "INVOICE_SENT",
  "PAYMENT_UPLOADED",
  "PAYMENT_VERIFIED",
  "IN_PROGRESS",
  "AT_OFFICE",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
]);

type ApplicationsPageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    q?: string;
    serviceId?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return adminMetadata(t("nav.applications"));
}

function parseDateStart(value?: string): Date | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseDateEnd(value?: string): Date | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const date = new Date(`${value}T23:59:59.999Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function AdminApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  const locale = "en";
    const t = await getTranslations("admin");

  const user = await requireAdminPortal();
  const isSuperAdmin = isSuperAdminRole(user.role);

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const search = params.q?.trim() || undefined;
  const serviceId = params.serviceId?.trim() || undefined;
  const dateFrom = parseDateStart(params.dateFrom);
  const dateTo = parseDateEnd(params.dateTo);
  const statusParam = params.status;
  const status =
    statusParam && validStatuses.has(statusParam)
      ? (statusParam as ApplicationStatus)
      : undefined;

  const filterParams = {
    q: search,
    serviceId,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };

  const [result, services] = await Promise.all([
    applicationRepository.listAdminPaginated({
      page,
      pageSize: adminDefaultPageSize,
      status,
      serviceId,
      dateFrom,
      dateTo,
      search,
    }),
    applicationRepository.listServicesForFilter(),
  ]);

  const rows = result.items.map((application) => {
    const submissionSource = resolveApplicationSubmissionSource({
      agentId: application.agent?.id,
      draftJson: application.draftJson,
    });

    return {
      id: application.id,
      trackingId: application.trackingId,
      status: application.status,
      createdAt: application.createdAt,
      serviceName:
        application.service.nameEn,
      customerName: application.user.name ?? "—",
      customerEmail: application.user.email,
      statusLabel: t(getAdminApplicationStatusLabelKey(application.status)),
      sourceLabel: t(getApplicationSubmissionSourceLabelKey(submissionSource)),
    };
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("applications.title")}
        description={t("applications.description")}
        actions={
          isSuperAdmin ? (
            <Button asChild>
              <Link href="/admin/applications/new">
                <Plus className="size-4" aria-hidden="true" />
                {t("applications.create")}
              </Link>
            </Button>
          ) : undefined
        }
      />

      <ApplicationQueueStats
        currentStatus={status}
        searchParams={filterParams}
      />

      <ApplicationFilters
        currentStatus={status}
        currentSearch={search}
        currentServiceId={serviceId}
        currentDateFrom={params.dateFrom}
        currentDateTo={params.dateTo}
        services={services}
        locale={locale}
      />

      {rows.length === 0 ? (
        <EmptyState
          title={t("applications.emptyTitle")}
          description={t("applications.emptyDescription")}
        />
      ) : (
        <div className="space-y-4 rounded-xl border p-4">
          <ApplicationsBulkSelectTable
            applications={rows}
            locale={locale}
            showEdit={isSuperAdmin}
            labels={{
              trackingId: t("applications.columns.trackingId"),
              service: t("applications.columns.service"),
              customer: t("applications.columns.customer"),
              source: t("applications.columns.source"),
              status: t("applications.columns.status"),
              created: t("applications.columns.created"),
              actions: t("applications.columns.actions"),
              view: t("applications.view"),
              edit: t("applications.edit"),
              select: t("applications.bulk.select"),
              bulkAssign: t("applications.bulk.assign"),
              bulkPending: t("applications.bulk.pending"),
              bulkPlaceholder: t("applications.bulk.placeholder"),
              bulkClear: t("applications.bulk.clear"),
            }}
          />

          <PaginationControls
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/applications"
            searchParams={{
              status,
              q: search,
              serviceId,
              dateFrom: params.dateFrom,
              dateTo: params.dateTo,
            }}
          />
        </div>
      )}
    </div>
  );
}
