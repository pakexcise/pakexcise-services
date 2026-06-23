import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import {
  LegalPageActiveToggle,
  LegalPagePublishToggle,
  LegalPageRowActions,
} from "@/features/legal-pages/admin/components/legal-page-list-actions";
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
import { Link } from "@/i18n/navigation";
import { legalPagePath } from "@/features/legal-pages/lib/constants";
import { formatDate } from "@/lib/utils";
import { adminLegalPageRepository } from "@/server/repositories/admin-legal-page-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { requireSuperAdmin } from "@/server/permissions/guards";

type LegalPagesAdminPageProps = {
  searchParams: Promise<{ page?: string; q?: string; status?: string; active?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.resources.legalPages");
  return adminMetadata(t("title"));
}

export default async function AdminLegalPagesPage({
  searchParams,
}: LegalPagesAdminPageProps) {
  await requireSuperAdmin();

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.resources.legalPages");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const q = params.q?.trim() || undefined;
  const status =
    params.status === "published" || params.status === "draft"
      ? params.status
      : "all";
  const active =
    params.active === "active" || params.active === "inactive"
      ? params.active
      : "all";

  const result = await adminLegalPageRepository.listPaginated({
    page,
    pageSize: adminDefaultPageSize,
    q,
    status,
    active,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button asChild>
            <Link href="/admin/legal-pages/new">
              <Plus className="size-4" />
              {t("create")}
            </Link>
          </Button>
        }
      />

      <form
        action="/admin/legal-pages"
        method="get"
        className="flex flex-wrap gap-3 rounded-xl border p-4"
      >
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder={t("searchPlaceholder")}
          className="max-w-sm"
        />
        <select name="status" defaultValue={status} className="h-10 rounded-md border px-3 text-sm">
          <option value="all">{t("filters.allStatuses")}</option>
          <option value="published">{t("filters.published")}</option>
          <option value="draft">{t("filters.draft")}</option>
        </select>
        <select name="active" defaultValue={active} className="h-10 rounded-md border px-3 text-sm">
          <option value="all">{t("filters.allActive")}</option>
          <option value="active">{t("filters.active")}</option>
          <option value="inactive">{t("filters.inactive")}</option>
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
                <TableHead>{t("table.title")}</TableHead>
                <TableHead>{t("table.slug")}</TableHead>
                <TableHead>{t("table.status")}</TableHead>
                <TableHead>{t("table.active")}</TableHead>
                <TableHead>{t("table.order")}</TableHead>
                <TableHead>{t("table.updated")}</TableHead>
                <TableHead>{t("table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.titleEn}</TableCell>
                  <TableCell>
                    <Link
                      href={legalPagePath(item.slug)}
                      className="font-mono text-xs text-primary hover:underline"
                      target="_blank"
                    >
                      {item.slug}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.isPublished ? "default" : "secondary"}>
                      {item.isPublished ? t("statusPublished") : t("statusDraft")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.isActive ? "outline" : "secondary"}>
                      {item.isActive ? t("activeYes") : t("activeNo")}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.displayOrder}</TableCell>
                  <TableCell>{formatDate(item.updatedAt, locale)}</TableCell>
                  <TableCell className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <LegalPagePublishToggle
                        id={item.id}
                        isPublished={item.isPublished}
                        publishLabel={t("publish")}
                        unpublishLabel={t("unpublish")}
                      />
                      <LegalPageActiveToggle
                        id={item.id}
                        isActive={item.isActive}
                        activateLabel={t("activate")}
                        deactivateLabel={t("deactivate")}
                      />
                    </div>
                    <LegalPageRowActions
                      id={item.id}
                      slug={item.slug}
                      editLabel={t("edit")}
                      deleteLabel={t("delete")}
                      deleteConfirm={t("deleteConfirm")}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/legal-pages"
            searchParams={{
              ...(q ? { q } : {}),
              ...(status !== "all" ? { status } : {}),
              ...(active !== "all" ? { active } : {}),
            }}
          />
        </>
      )}
    </div>
  );
}
