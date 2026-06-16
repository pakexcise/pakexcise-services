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
import { adminCityRepository } from "@/server/repositories/admin-city-repository";
import { adminRegionRepository } from "@/server/repositories/admin-region-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

type AdminCitiesPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    active?: string;
    regionId?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.cities");
  return adminMetadata(t("title"));
}

export default async function AdminCitiesPage({
  searchParams,
}: AdminCitiesPageProps) {
  await enforcePermissionAccess("region:manage")();

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.cities");
  const params = await searchParams;

  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const q = params.q?.trim() || undefined;
  const regionId = params.regionId || undefined;
  const active =
    params.active === "true" || params.active === "false"
      ? params.active
      : "all";

  const [result, regions] = await Promise.all([
    adminCityRepository.listPaginated({
      page,
      pageSize: adminDefaultPageSize,
      q,
      active,
      regionId,
    }),
    adminRegionRepository.listOptions(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button asChild>
            <Link href="/admin/cities/new">
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
          name="regionId"
          defaultValue={regionId ?? ""}
          className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{t("filters.allRegions")}</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {locale === "ur" ? region.nameUr : region.nameEn}
            </option>
          ))}
        </select>
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
                <TableHead>{t("columns.region")}</TableHead>
                <TableHead>{t("columns.slug")}</TableHead>
                <TableHead>{t("columns.order")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead className="text-end">{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((city) => (
                <TableRow key={city.id}>
                  <TableCell>
                    {locale === "ur" ? city.nameUr : city.nameEn}
                  </TableCell>
                  <TableCell>
                    {locale === "ur" ? city.region.nameUr : city.region.nameEn}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{city.slug}</TableCell>
                  <TableCell>{city.displayOrder}</TableCell>
                  <TableCell>
                    {city.isActive ? t("status.active") : t("status.inactive")}
                  </TableCell>
                  <TableCell className="text-end">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/cities/${city.id}/edit`}>
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
            basePath="/admin/cities"
            searchParams={{
              q,
              regionId,
              active: active === "all" ? undefined : active,
            }}
          />
        </>
      )}
    </div>
  );
}
