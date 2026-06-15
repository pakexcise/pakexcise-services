import type { ContactInquiryStatus } from "@prisma/client";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { adminMetadata } from "@/features/admin/lib/metadata";
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
import { formatDate } from "@/lib/utils";
import { contactInquiryRepository } from "@/server/repositories/contact-inquiry-repository";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";
import { getCurrentLocale } from "@/server/i18n/get-locale";

const validStatuses = new Set<string>(["NEW", "CONTACTED", "CLOSED", "SPAM"]);

type AdminContactInquiriesPageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    q?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.contactInquiries");
  return adminMetadata(t("title"));
}

function statusBadgeVariant(
  status: ContactInquiryStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "NEW":
      return "default";
    case "SPAM":
    case "CLOSED":
      return "secondary";
    default:
      return "outline";
  }
}

export default async function AdminContactInquiriesPage({
  searchParams,
}: AdminContactInquiriesPageProps) {
  await enforcePermissionAccess("application:read")();
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.contactInquiries");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const search = params.q?.trim() || undefined;
  const statusParam = params.status?.trim();
  const status =
    statusParam && validStatuses.has(statusParam)
      ? (statusParam as ContactInquiryStatus)
      : undefined;

  const result = await contactInquiryRepository.listAdminPaginated({
    page,
    pageSize: adminDefaultPageSize,
    query: search,
    status,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />

      <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1">
          <label htmlFor="contact-inquiry-search" className="text-sm font-medium">
            {t("search")}
          </label>
          <input
            id="contact-inquiry-search"
            name="q"
            defaultValue={search ?? ""}
            placeholder={t("searchPlaceholder")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="contact-inquiry-status-filter" className="text-sm font-medium">
            {t("columns.status")}
          </label>
          <select
            id="contact-inquiry-status-filter"
            name="status"
            defaultValue={status ?? ""}
            className="flex h-10 min-w-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{t("allStatuses")}</option>
            {(["NEW", "CONTACTED", "CLOSED", "SPAM"] as const).map((value) => (
              <option key={value} value={value}>
                {t(`status.${value}`)}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit">{t("searchButton")}</Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.reference")}</TableHead>
                  <TableHead>{t("columns.name")}</TableHead>
                  <TableHead>{t("columns.phone")}</TableHead>
                  <TableHead>{t("columns.service")}</TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                  <TableHead>{t("columns.created")}</TableHead>
                  <TableHead>{t("columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell className="font-mono text-xs">{inquiry.referenceId}</TableCell>
                    <TableCell>{inquiry.fullName}</TableCell>
                    <TableCell>{inquiry.phone}</TableCell>
                    <TableCell>{inquiry.serviceInterest}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(inquiry.status)}>
                        {t(`status.${inquiry.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(inquiry.createdAt, locale)}</TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/contact-inquiries/${inquiry.id}`}>
                          {t("view")}
                        </Link>
                      </Button>
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
            searchParams={{
              q: search,
              status: statusParam,
            }}
          />
        </>
      )}
    </div>
  );
}
