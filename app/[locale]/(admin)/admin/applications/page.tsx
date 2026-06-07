import type { ApplicationStatus } from "@prisma/client";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ApplicationFilters } from "@/features/admin/components/application-filters";
import { ApplicationStatusBadge } from "@/features/admin/components/application-status-badge";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { getApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminDefaultPageSize } from "@/config/admin";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";
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

type ApplicationsPageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    q?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return adminMetadata(t("nav.applications"));
}

export default async function AdminApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const search = params.q?.trim() || undefined;
  const statusParam = params.status;
  const status =
    statusParam && validStatuses.has(statusParam)
      ? (statusParam as ApplicationStatus)
      : undefined;

  let result = {
    items: [] as Awaited<
      ReturnType<typeof applicationRepository.listAdminPaginated>
    >["items"],
    page: 1,
    pageSize: adminDefaultPageSize,
    total: 0,
    totalPages: 1,
  };

  try {
    result = await applicationRepository.listAdminPaginated({
      page,
      pageSize: adminDefaultPageSize,
      status,
      search,
    });
  } catch {
    result = {
      items: [],
      page: 1,
      pageSize: adminDefaultPageSize,
      total: 0,
      totalPages: 1,
    };
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("applications.title")}
        description={t("applications.description")}
      />

      <ApplicationFilters currentStatus={status} currentSearch={search} />

      {result.items.length === 0 ? (
        <EmptyState
          title={t("applications.emptyTitle")}
          description={t("applications.emptyDescription")}
        />
      ) : (
        <div className="space-y-4 rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("applications.columns.trackingId")}</TableHead>
                <TableHead>{t("applications.columns.service")}</TableHead>
                <TableHead>{t("applications.columns.customer")}</TableHead>
                <TableHead>{t("applications.columns.status")}</TableHead>
                <TableHead>{t("applications.columns.created")}</TableHead>
                <TableHead className="text-right">
                  {t("applications.columns.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-mono text-xs">
                    {application.trackingId}
                  </TableCell>
                  <TableCell>
                    {locale === "ur"
                      ? application.service.nameUr
                      : application.service.nameEn}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{application.user.name ?? "—"}</span>
                      <span className="text-xs text-muted-foreground">
                        {application.user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ApplicationStatusBadge
                      status={application.status}
                      label={t(
                        getApplicationStatusLabelKey(application.status),
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    {formatDate(application.createdAt, locale)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/applications/${application.id}`}>
                        {t("applications.view")}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="px-4 pb-4">
            <PaginationControls
              page={result.page}
              totalPages={result.totalPages}
              basePath="/admin/applications"
              searchParams={{
                status,
                q: search,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
