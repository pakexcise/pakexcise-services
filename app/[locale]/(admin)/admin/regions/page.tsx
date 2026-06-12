import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { adminMetadata } from "@/features/admin/lib/metadata";
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
import { adminDefaultPageSize } from "@/config/admin";
import { Link } from "@/i18n/navigation";
import { adminRegionRepository } from "@/server/repositories/admin-region-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";

type RegionsAdminPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    active?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.regions");
  return adminMetadata(t("title"));
}

export default async function AdminRegionsPage({
  searchParams,
}: RegionsAdminPageProps) {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.regions");
  const params = await searchParams;

  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const q = params.q?.trim() || undefined;
  const active =
    params.active === "true" || params.active === "false"
      ? params.active
      : "all";

  const result = await adminRegionRepository.listPaginated({
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
          <Button asChild>
            <Link href="/admin/regions/new">
              <Plus className="size-4" aria-hidden="true" />
              {t("create")}
            </Link>
          </Button>
        }
      />

      <form className="flex flex-wrap gap-3">
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder={t("searchPlaceholder")}
          className="max-w-xs"
        />
        <select
          name="active"
          defaultValue={active}
          className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">{t("filters.all")}</option>
          <option value="true">{t("status.active")}</option>
          <option value="false">{t("status.inactive")}</option>
        </select>
        <Button type="submit" variant="outline">
          {t("filters.apply")}
        </Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.name")}</TableHead>
                <TableHead>{t("columns.slug")}</TableHead>
                <TableHead>{t("columns.cities")}</TableHead>
                <TableHead>{t("columns.services")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead className="text-end">{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((region) => (
                <TableRow key={region.id}>
                  <TableCell>
                    {locale === "ur" ? region.nameUr : region.nameEn}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{region.slug}</TableCell>
                  <TableCell>{region._count.cities}</TableCell>
                  <TableCell>{region._count.serviceRegions}</TableCell>
                  <TableCell>
                    {region.isActive ? t("status.active") : t("status.inactive")}
                  </TableCell>
                  <TableCell className="text-end">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/regions/${region.id}/edit`}>
                        {t("actions.edit")}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <PaginationControls
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/regions"
            searchParams={{ q, active: active === "all" ? undefined : active }}
          />
        </>
      )}
    </div>
  );
}
