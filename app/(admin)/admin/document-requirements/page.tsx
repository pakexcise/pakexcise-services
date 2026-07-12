import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

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
import { Badge } from "@/components/ui/badge";
import { adminDefaultPageSize } from "@/config/admin";
import { adminDocumentRequirementRepository } from "@/server/repositories/admin-document-requirement-repository";
import { adminRegionRepository } from "@/server/repositories/admin-region-repository";
import { adminServiceRepository } from "@/server/repositories/admin-service-repository";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

type AdminDocumentRequirementsPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    active?: string;
    serviceId?: string;
    regionId?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.documentRequirements");
  return adminMetadata(t("title"));
}

export default async function AdminDocumentRequirementsPage({
  searchParams,
}: AdminDocumentRequirementsPageProps) {
  await enforcePermissionAccess("service:manage")();

  const locale = "en";
    const t = await getTranslations("admin.documentRequirements");
  const params = await searchParams;

  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const q = params.q?.trim() || undefined;
  const serviceId = params.serviceId || undefined;
  const regionId = params.regionId || undefined;
  const active =
    params.active === "true" || params.active === "false"
      ? params.active
      : "all";

  const [result, services, regions] = await Promise.all([
    adminDocumentRequirementRepository.listPaginated({
      page,
      pageSize: adminDefaultPageSize,
      q,
      active,
      serviceId,
      regionId,
    }),
    adminServiceRepository.listOptions(),
    adminRegionRepository.listOptions(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
      />

      <form className="flex flex-wrap gap-3">
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder={t("searchPlaceholder")}
          className="max-w-xs"
        />
        <select
          name="serviceId"
          defaultValue={serviceId ?? ""}
          className="flex h-10 max-w-xs rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{t("filters.allServices")}</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.nameEn}
            </option>
          ))}
        </select>
        <select
          name="regionId"
          defaultValue={regionId ?? ""}
          className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{t("filters.allRegions")}</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.nameEn}
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
                <TableHead>{t("columns.document")}</TableHead>
                <TableHead>{t("columns.service")}</TableHead>
                <TableHead>{t("columns.region")}</TableHead>
                <TableHead>{t("columns.required")}</TableHead>
                <TableHead>{t("columns.order")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead className="text-end">{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {item.labelEn}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {item.docType}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.service.nameEn}
                  </TableCell>
                  <TableCell>
                    {item.region
                      ? item.region.nameEn
                      : t("allRegions")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.isRequired ? "default" : "secondary"}>
                      {item.isRequired ? t("required") : t("optional")}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.displayOrder}</TableCell>
                  <TableCell>
                    {item.isActive ? t("status.active") : t("status.inactive")}
                  </TableCell>
                  <TableCell className="text-end">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/services/${item.service.id}/edit`}>
                        {t("actions.manage")}
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
            basePath="/admin/document-requirements"
            searchParams={{
              q,
              serviceId,
              regionId,
              active: active === "all" ? undefined : active,
            }}
          />
        </>
      )}
    </div>
  );
}
