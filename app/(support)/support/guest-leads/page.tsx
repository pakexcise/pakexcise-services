import { copy, createT } from "@/messages";
import type { GuestLeadStatus } from "@prisma/client";
import type { Metadata, Route } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { adminDefaultPageSize } from "@/config/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { guestLeadRepository } from "@/server/repositories/guest-lead-repository";


import Link from "next/link";
const validStatuses = new Set<string>([
  "NEW",
  "CONTACTED",
  "IN_PROGRESS",
  "CONVERTED",
  "CLOSED",
  "SPAM"]);

const basePath = "/support/guest-leads";

type SupportGuestLeadsPageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    q?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = createT(copy.admin);
  return adminMetadata(t("guestLeads.title"));
}

function statusBadgeVariant(
  status: GuestLeadStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "NEW":
      return "default";
    case "SPAM":
    case "CLOSED":
      return "secondary";
    case "CONVERTED":
      return "outline";
    default:
      return "secondary";
  }
}

export default async function SupportGuestLeadsPage({
  searchParams}: SupportGuestLeadsPageProps) {
  const locale = "en";
  const t = createT(copy.admin);

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const search = params.q?.trim() || undefined;
  const statusParam = params.status?.trim();
  const status =
    statusParam && validStatuses.has(statusParam)
      ? (statusParam as GuestLeadStatus)
      : undefined;

  const result = await guestLeadRepository.listAdminPaginated({
    page,
    pageSize: adminDefaultPageSize,
    search,
    status});

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("guestLeads.title")}
        description={t("guestLeads.description")}
      />

      <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1">
          <label htmlFor="guest-lead-search" className="text-sm font-medium">
            {t("search")}
          </label>
          <input
            id="guest-lead-search"
            name="q"
            defaultValue={search ?? ""}
            placeholder={t("guestLeads.searchPlaceholder")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="guest-lead-status-filter" className="text-sm font-medium">
            {t("guestLeads.columns.status")}
          </label>
          <select
            id="guest-lead-status-filter"
            name="status"
            defaultValue={status ?? ""}
            className="flex h-10 min-w-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">{t("guestLeads.allStatuses")}</option>
            {(["NEW", "CONTACTED", "IN_PROGRESS", "CONVERTED", "CLOSED", "SPAM"] as const).map(
              (value) => (
                <option key={value} value={value}>
                  {t(`guestLeads.status.${value}`)}
                </option>
              ),
            )}
          </select>
        </div>
        <Button type="submit">{t("search")}</Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          title={t("guestLeads.emptyTitle")}
          description={t("guestLeads.emptyDescription")}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("guestLeads.columns.reference")}</TableHead>
                  <TableHead>{t("guestLeads.columns.name")}</TableHead>
                  <TableHead>{t("guestLeads.columns.phone")}</TableHead>
                  <TableHead>{t("guestLeads.columns.service")}</TableHead>
                  <TableHead>{t("guestLeads.columns.status")}</TableHead>
                  <TableHead>{t("guestLeads.columns.created")}</TableHead>
                  <TableHead>{t("guestLeads.columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-mono text-xs">{lead.referenceId}</TableCell>
                    <TableCell>{lead.fullName}</TableCell>
                    <TableCell>{lead.phone}</TableCell>
                    <TableCell>
                      {lead.serviceNameEn ?? ""}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(lead.status)}>
                        {t(`guestLeads.status.${lead.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(lead.createdAt, locale)}</TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`${basePath}/${lead.id}` as Route}>
                          {t("guestLeads.view")}
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
            basePath={basePath}
            searchParams={{
              q: search,
              status: statusParam}}
          />
        </>
      )}
    </div>
  );
}
