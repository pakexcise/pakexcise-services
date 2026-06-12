import type { ApplicationStatus } from "@prisma/client";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SupportApplicationsTable } from "@/components/support/support-applications-table";
import { supportApplicationsBasePath } from "@/config/support";
import { adminDefaultPageSize } from "@/config/admin";
import { ApplicationFilters } from "@/features/admin/components/application-filters";
import { ApplicationQueueStats } from "@/features/admin/components/application-queue-stats";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { getAdminApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import { applicationRepository } from "@/server/repositories/application-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";

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

type SupportApplicationsPageProps = {
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
  const t = await getTranslations("support.applications");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
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

export default async function SupportApplicationsPage({
  searchParams,
}: SupportApplicationsPageProps) {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("support.applications");
  const tAdmin = await getTranslations("admin");

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

  const rows = result.items.map((application) => ({
    id: application.id,
    trackingId: application.trackingId,
    status: application.status,
    createdAt: application.createdAt,
    serviceName:
      locale === "ur"
        ? application.service.nameUr
        : application.service.nameEn,
    customerName: application.user.name ?? "—",
    customerEmail: application.user.email,
    statusLabel: tAdmin(getAdminApplicationStatusLabelKey(application.status)),
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <ApplicationQueueStats
        currentStatus={status}
        searchParams={filterParams}
        applicationsBasePath={supportApplicationsBasePath}
      />

      <ApplicationFilters
        currentStatus={status}
        currentSearch={search}
        currentServiceId={serviceId}
        currentDateFrom={params.dateFrom}
        currentDateTo={params.dateTo}
        services={services}
        locale={locale}
        applicationsBasePath={supportApplicationsBasePath}
      />

      {rows.length === 0 ? (
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      ) : (
        <div className="space-y-4 rounded-xl border p-4">
          <SupportApplicationsTable
            applications={rows}
            locale={locale}
            detailBasePath={supportApplicationsBasePath}
            labels={{
              trackingId: tAdmin("applications.columns.trackingId"),
              service: tAdmin("applications.columns.service"),
              customer: tAdmin("applications.columns.customer"),
              status: tAdmin("applications.columns.status"),
              created: tAdmin("applications.columns.created"),
              actions: tAdmin("applications.columns.actions"),
              view: tAdmin("applications.view"),
            }}
          />

          <PaginationControls
            page={result.page}
            totalPages={result.totalPages}
            basePath={supportApplicationsBasePath}
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
