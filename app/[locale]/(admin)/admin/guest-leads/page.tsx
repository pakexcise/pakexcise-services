import type { GuestLeadStatus } from "@prisma/client";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { SupportRequestFilters } from "@/features/guest-leads/admin/components/support-request-filters";
import { SupportRequestStatusBadge } from "@/features/guest-leads/admin/components/support-request-status-badge";
import { SupportRequestStatusStats } from "@/features/guest-leads/admin/components/support-request-status-stats";
import { adminDefaultPageSize } from "@/config/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { pickLocalized } from "@/lib/i18n/content";
import { formatDate } from "@/lib/utils";
import { guestLeadRepository } from "@/server/repositories/guest-lead-repository";
import { adminServiceRepository } from "@/server/repositories/admin-service-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";
import { requireAdminPortal } from "@/server/permissions/guards";
import { isSuperAdminRole } from "@/server/permissions/admin-scope";

const validStatuses = new Set<string>([
  "NEW",
  "CONTACTED",
  "IN_PROGRESS",
  "CONVERTED",
  "CLOSED",
  "SPAM",
]);

const validSources = new Set<string>(["WHATSAPP", "GUEST_FORM"]);

type AdminGuestLeadsPageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    q?: string;
    serviceId?: string;
    source?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return adminMetadata(t("guestLeads.title"));
}

function parseDateStart(value?: string): Date | undefined {
  if (!value?.trim()) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseDateEnd(value?: string): Date | undefined {
  if (!value?.trim()) return undefined;
  const date = new Date(`${value}T23:59:59.999Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function AdminGuestLeadsPage({
  searchParams,
}: AdminGuestLeadsPageProps) {
  await enforcePermissionAccess("application:read")();

  const user = await requireAdminPortal();
  const isSuperAdmin = isSuperAdminRole(user.role);

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const search = params.q?.trim() || undefined;
  const serviceId = params.serviceId?.trim() || undefined;
  const dateFrom = parseDateStart(params.dateFrom);
  const dateTo = parseDateEnd(params.dateTo);
  const statusParam = params.status?.trim();
  const sourceParam = params.source?.trim();
  const status =
    statusParam && validStatuses.has(statusParam)
      ? (statusParam as GuestLeadStatus)
      : undefined;
  const source =
    sourceParam && validSources.has(sourceParam)
      ? (sourceParam as "WHATSAPP" | "GUEST_FORM")
      : undefined;

  const filterParams = {
    q: search,
    serviceId,
    source: sourceParam,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };

  const [result, services] = await Promise.all([
    guestLeadRepository.listAdminPaginated({
      page,
      pageSize: adminDefaultPageSize,
      search,
      status,
      serviceId,
      source,
      dateFrom,
      dateTo,
    }),
    adminServiceRepository.listOptions(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("guestLeads.title")}
        description={t("guestLeads.description")}
        actions={
          isSuperAdmin ? (
            <Button asChild>
              <Link href="/admin/guest-leads/new">
                <Plus className="size-4" aria-hidden="true" />
                {t("guestLeads.create")}
              </Link>
            </Button>
          ) : undefined
        }
      />

      <SupportRequestStatusStats
        currentStatus={status}
        searchParams={filterParams}
      />

      <SupportRequestFilters
        currentStatus={status}
        currentSearch={search}
        currentServiceId={serviceId}
        currentSource={sourceParam}
        currentDateFrom={params.dateFrom}
        currentDateTo={params.dateTo}
        services={services}
        locale={locale}
      />

      {result.items.length === 0 ? (
        <EmptyState
          title={t("guestLeads.emptyTitle")}
          description={t("guestLeads.emptyDescription")}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("guestLeads.columns.reference")}</TableHead>
                  <TableHead>{t("guestLeads.columns.name")}</TableHead>
                  <TableHead>{t("guestLeads.columns.phone")}</TableHead>
                  <TableHead>{t("guestLeads.columns.service")}</TableHead>
                  <TableHead>{t("guestLeads.columns.region")}</TableHead>
                  <TableHead>{t("guestLeads.columns.source")}</TableHead>
                  <TableHead>{t("guestLeads.columns.status")}</TableHead>
                  <TableHead>{t("guestLeads.columns.created")}</TableHead>
                  <TableHead className="text-end">
                    {t("guestLeads.columns.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">
                      <Link
                        href={`/admin/guest-leads/${lead.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {lead.referenceId}
                      </Link>
                    </TableCell>
                    <TableCell>{lead.fullName}</TableCell>
                    <TableCell className="whitespace-nowrap">{lead.phone}</TableCell>
                    <TableCell className="max-w-[180px] truncate">
                      {pickLocalized(locale, {
                        en: lead.serviceNameEn,
                        ur: lead.serviceNameUr,
                      })}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate">
                      {pickLocalized(locale, {
                        en: lead.regionNameEn,
                        ur: lead.regionNameUr,
                      }) || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {t(`guestLeads.source.${lead.source}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <SupportRequestStatusBadge
                        status={lead.status}
                        label={t(`guestLeads.status.${lead.status}`)}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(lead.createdAt, locale)}
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/guest-leads/${lead.id}`}>
                            {t("guestLeads.view")}
                          </Link>
                        </Button>
                        {isSuperAdmin ? (
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/admin/guest-leads/${lead.id}/edit`}>
                              {t("guestLeads.edit")}
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <PaginationControls
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/guest-leads"
            searchParams={filterParams}
          />
        </>
      )}
    </div>
  );
}
