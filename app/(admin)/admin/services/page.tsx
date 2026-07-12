import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { adminMetadata } from "@/features/admin/lib/metadata";
import {
  ServiceActiveToggle,
  ServiceRowActions,
} from "@/features/services/admin/components/service-list-actions";
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
import { adminServiceRepository } from "@/server/repositories/admin-service-repository";
import { regionRepository } from "@/server/repositories";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

type ServicesAdminPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    regionId?: string;
    active?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return adminMetadata(t("nav.services"));
}

export default async function AdminServicesPage({
  searchParams,
}: ServicesAdminPageProps) {
  await enforcePermissionAccess("service:manage")();

  const locale = "en";
    const t = await getTranslations("admin.services");
  const params = await searchParams;

  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const q = params.q?.trim() || undefined;
  const regionId = params.regionId || undefined;
  const active =
    params.active === "true" || params.active === "false"
      ? params.active
      : "all";

  const [result, regions] = await Promise.all([
    adminServiceRepository.listPaginated({
      page,
      pageSize: adminDefaultPageSize,
      q,
      regionId,
      active,
    }),
    regionRepository.listAdmin(),
  ]);

  const listLabels = {
    edit: t("actions.edit"),
    delete: t("actions.delete"),
    confirmDelete: t("actions.confirmDelete"),
    active: t("status.active"),
    inactive: t("status.inactive"),
    moveUp: t("actions.moveUp"),
    moveDown: t("actions.moveDown"),
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button asChild>
            <Link href="/admin/services/new">
              <Plus className="size-4" aria-hidden="true" />
              {t("create")}
            </Link>
          </Button>
        }
      />

      <form
        action="/admin/services"
        method="get"
        className="grid gap-3 rounded-xl border p-4 md:grid-cols-[minmax(0,1fr)_200px_160px_auto]"
      >
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder={t("searchPlaceholder")}
        />
        <select
          name="regionId"
          defaultValue={regionId ?? ""}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{t("allRegions")}</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.nameEn}
            </option>
          ))}
        </select>
        <select
          name="active"
          defaultValue={active}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">{t("allStatuses")}</option>
          <option value="true">{t("status.active")}</option>
          <option value="false">{t("status.inactive")}</option>
        </select>
        <Button type="submit" variant="secondary">
          {t("filter")}
        </Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      ) : (
        <div className="space-y-4 rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.order")}</TableHead>
                <TableHead>{t("columns.name")}</TableHead>
                <TableHead>{t("columns.region")}</TableHead>
                <TableHead>{t("columns.slug")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead className="text-right">{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.displayOrder}</TableCell>
                  <TableCell>
                    {service.nameEn}
                  </TableCell>
                  <TableCell>
                    {service.serviceRegions
                      .map((entry) =>
                        entry.region.nameEn,
                      )
                      .join(", ") || "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{service.slug}</TableCell>
                  <TableCell>
                    <ServiceActiveToggle service={service} labels={listLabels} />
                  </TableCell>
                  <TableCell className="text-right">
                    <ServiceRowActions
                      service={service}
                      labels={listLabels}
                      siblings={result.items}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="px-4 pb-4">
            <PaginationControls
              page={result.page}
              totalPages={result.totalPages}
              basePath="/admin/services"
              searchParams={{ q, regionId, active: active === "all" ? undefined : active }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
