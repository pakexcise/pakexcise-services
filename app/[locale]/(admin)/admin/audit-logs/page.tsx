import type { AuditAction } from "@prisma/client";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { adminDefaultPageSize } from "@/config/admin";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { requirePermission } from "@/server/permissions/guards";
import { adminAuditRepository } from "@/server/repositories/admin-audit-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { AdminScopeNotice } from "@/features/admin/components/admin-scope-notice";

const validActions = new Set<string>([
  "CREATE",
  "UPDATE",
  "DELETE",
  "STATUS_CHANGE",
  "LOGIN",
  "LOGOUT",
  "EXPORT",
]);

type AuditLogsPageProps = {
  searchParams: Promise<{
    page?: string;
    entityType?: string;
    action?: string;
    q?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return adminMetadata(t("nav.auditLogs"));
}

export default async function AdminAuditLogsPage({
  searchParams,
}: AuditLogsPageProps) {
  const user = await requirePermission("audit:read");

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin");
  const params = await searchParams;

  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const actionParam = params.action?.trim();
  const action =
    actionParam && validActions.has(actionParam)
      ? (actionParam as AuditAction)
      : undefined;

  const result = await adminAuditRepository.list({
    page,
    pageSize: adminDefaultPageSize,
    entityType: params.entityType,
    action,
    q: params.q,
    viewerRole: user.role,
  });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={t("resources.auditLogs.title")}
        description={t("resources.auditLogs.description")}
      />

      {user.role === "ADMIN" ? (
        <AdminScopeNotice message={t("auditLogs.scopeNotice")} />
      ) : null}

      {result.items.length === 0 ? (
        <EmptyState
          title={t("resources.auditLogs.emptyTitle")}
          description={t("resources.auditLogs.emptyDescription")}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("auditLogs.columns.time")}</TableHead>
                  <TableHead>{t("auditLogs.columns.actor")}</TableHead>
                  <TableHead>{t("auditLogs.columns.action")}</TableHead>
                  <TableHead>{t("auditLogs.columns.entity")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDate(log.createdAt, locale)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.actorName ?? log.actorEmail ?? t("auditLogs.systemActor")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="font-medium">{log.entityType}</span>
                      {log.entityId ? (
                        <span className="block text-xs text-muted-foreground">
                          {log.entityId}
                        </span>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <PaginationControls
            page={result.page}
            totalPages={Math.max(1, Math.ceil(result.total / result.pageSize))}
            basePath="/admin/audit-logs"
            searchParams={{
              ...(params.entityType ? { entityType: params.entityType } : {}),
              ...(action ? { action } : {}),
              ...(params.q ? { q: params.q } : {}),
            }}
          />
        </>
      )}
    </div>
  );
}
