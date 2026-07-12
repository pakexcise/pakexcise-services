import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { adminDefaultPageSize } from "@/config/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RedirectBulkActions } from "@/features/redirects/admin/components/redirect-bulk-actions";
import { RedirectRowActions } from "@/features/redirects/admin/components/redirect-row-actions";
import { formatDate } from "@/lib/utils";
import { adminRedirectRepository } from "@/server/repositories/admin-redirect-repository";
import { enforcePlatformManageAccess } from "@/server/permissions/platform-access";

type RedirectsAdminPageProps = {
  searchParams: Promise<{ page?: string; q?: string; active?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.resources.redirects");
  return adminMetadata(t("title"));
}

export default async function AdminRedirectsPage({
  searchParams,
}: RedirectsAdminPageProps) {
  await enforcePlatformManageAccess();

  const locale = "en";
    const t = await getTranslations("admin.resources.redirects");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const q = params.q?.trim() || undefined;
  const active =
    params.active === "true" || params.active === "false" ? params.active : "all";

  const result = await adminRedirectRepository.listPaginated({
    page,
    pageSize: adminDefaultPageSize,
    q,
    active,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <RedirectBulkActions
              hasItems={result.total > 0}
              labels={{
                clearAll: t("clearAll"),
                clearAllConfirm: t("clearAllConfirm"),
                clearAllSuccess: t("clearAllSuccess"),
                clearAllError: t("clearAllError"),
              }}
            />
            <Button asChild>
              <Link href="/admin/redirects/new">
                <Plus className="size-4" />
                {t("create")}
              </Link>
            </Button>
          </div>
        }
      />

      <div className="space-y-2 rounded-xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <p>{t("setupHint")}</p>
        <p>{t("setupHintBuiltIn")}</p>
      </div>

      <form
        action="/admin/redirects"
        method="get"
        className="flex flex-wrap gap-3 rounded-xl border p-4"
      >
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder={t("searchPlaceholder")}
          className="max-w-sm"
        />
        <select
          name="active"
          defaultValue={active}
          className="h-10 rounded-md border px-3 text-sm"
        >
          <option value="all">{t("filterAll")}</option>
          <option value="true">{t("filterActive")}</option>
          <option value="false">{t("filterInactive")}</option>
        </select>
        <Button type="submit">{t("filter")}</Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.oldSlug")}</TableHead>
                <TableHead>{t("columns.newSlug")}</TableHead>
                <TableHead>{t("columns.code")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead>{t("columns.updated")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((redirect) => (
                <TableRow key={redirect.id}>
                  <TableCell className="font-mono text-xs">{redirect.oldSlug}</TableCell>
                  <TableCell className="font-mono text-xs">{redirect.newSlug}</TableCell>
                  <TableCell>{redirect.statusCode}</TableCell>
                  <TableCell>
                    <Badge variant={redirect.isActive ? "default" : "secondary"}>
                      {redirect.isActive ? t("statusActive") : t("statusInactive")}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(redirect.updatedAt, locale)}</TableCell>
                  <TableCell>
                    <RedirectRowActions
                      id={redirect.id}
                      editHref={`/admin/redirects/${redirect.id}/edit`}
                      labels={{
                        edit: t("edit"),
                        delete: t("delete"),
                        deleteConfirm: t("deleteConfirm"),
                        deleteError: t("deleteError"),
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/redirects"
            searchParams={{
              ...(q ? { q } : {}),
              ...(active !== "all" ? { active } : {}),
            }}
          />
        </>
      )}
    </div>
  );
}
