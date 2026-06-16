import type { ContactInquiryStatus } from "@prisma/client";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { ContactInquiryFilters } from "@/features/contact-inquiries/admin/components/contact-inquiry-filters";
import { ContactInquiryStatusBadge } from "@/features/contact-inquiries/admin/components/contact-inquiry-status-badge";
import { ContactInquiryStatusStats } from "@/features/contact-inquiries/admin/components/contact-inquiry-status-stats";
import { adminDefaultPageSize } from "@/config/admin";
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
import { formatDate } from "@/lib/utils";
import { contactInquiryRepository } from "@/server/repositories/contact-inquiry-repository";
import { adminServiceRepository } from "@/server/repositories/admin-service-repository";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { requireAdminPortal } from "@/server/permissions/guards";
import { isSuperAdminRole } from "@/server/permissions/admin-scope";

const validStatuses = new Set<string>(["NEW", "CONTACTED", "CLOSED", "SPAM"]);

type AdminContactInquiriesPageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    q?: string;
    serviceInterest?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.contactInquiries");
  return adminMetadata(t("title"));
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

export default async function AdminContactInquiriesPage({
  searchParams,
}: AdminContactInquiriesPageProps) {
  await enforcePermissionAccess("application:read")();

  const user = await requireAdminPortal();
  const isSuperAdmin = isSuperAdminRole(user.role);

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.contactInquiries");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const search = params.q?.trim() || undefined;
  const serviceInterest = params.serviceInterest?.trim() || undefined;
  const dateFrom = parseDateStart(params.dateFrom);
  const dateTo = parseDateEnd(params.dateTo);
  const statusParam = params.status?.trim();
  const status =
    statusParam && validStatuses.has(statusParam)
      ? (statusParam as ContactInquiryStatus)
      : undefined;

  const filterParams = {
    q: search,
    serviceInterest,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  };

  const [result, services] = await Promise.all([
    contactInquiryRepository.listAdminPaginated({
      page,
      pageSize: adminDefaultPageSize,
      query: search,
      status,
      serviceInterest,
      dateFrom,
      dateTo,
    }),
    adminServiceRepository.listOptions(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
        actions={
          isSuperAdmin ? (
            <Button asChild>
              <Link href="/admin/contact-inquiries/new">
                <Plus className="size-4" aria-hidden="true" />
                {t("create")}
              </Link>
            </Button>
          ) : undefined
        }
      />

      <ContactInquiryStatusStats
        currentStatus={status}
        searchParams={filterParams}
      />

      <ContactInquiryFilters
        currentStatus={status}
        currentSearch={search}
        currentServiceInterest={serviceInterest}
        currentDateFrom={params.dateFrom}
        currentDateTo={params.dateTo}
        services={services}
        locale={locale}
      />

      {result.items.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.reference")}</TableHead>
                  <TableHead>{t("columns.name")}</TableHead>
                  <TableHead>{t("columns.phone")}</TableHead>
                  <TableHead>{t("columns.service")}</TableHead>
                  <TableHead>{t("columns.region")}</TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                  <TableHead>{t("columns.created")}</TableHead>
                  <TableHead className="text-end">{t("columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((inquiry) => (
                  <TableRow key={inquiry.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">
                      <Link
                        href={`/admin/contact-inquiries/${inquiry.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {inquiry.referenceId}
                      </Link>
                    </TableCell>
                    <TableCell>{inquiry.fullName}</TableCell>
                    <TableCell className="whitespace-nowrap">{inquiry.phone}</TableCell>
                    <TableCell className="max-w-[160px] truncate">
                      {inquiry.serviceInterest}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate">
                      {inquiry.regionName ?? "—"}
                    </TableCell>
                    <TableCell>
                      <ContactInquiryStatusBadge
                        status={inquiry.status}
                        label={t(`status.${inquiry.status}`)}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(inquiry.createdAt, locale)}
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/contact-inquiries/${inquiry.id}`}>
                            {t("view")}
                          </Link>
                        </Button>
                        {isSuperAdmin ? (
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/admin/contact-inquiries/${inquiry.id}/edit`}>
                              {t("edit")}
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
            basePath="/admin/contact-inquiries"
            searchParams={filterParams}
          />
        </>
      )}
    </div>
  );
}
