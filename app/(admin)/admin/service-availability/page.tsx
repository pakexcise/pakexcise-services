import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { ServiceAvailabilityMatrix } from "@/features/services/admin/components/service-availability-matrix";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";
import { serviceRegionRepository } from "@/server/repositories/service-region-repository";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.serviceAvailability");
  return adminMetadata(t("title"));
}

export default async function AdminServiceAvailabilityPage() {
  await enforcePermissionAccess("service:manage")();

  const locale = "en";
    const t = await getTranslations("admin.serviceAvailability");

  const matrix = await serviceRegionRepository.listMatrixData();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
      />
      <ServiceAvailabilityMatrix
        services={matrix.services}
        regions={matrix.regions}
        initialAssignments={matrix.assignments}
        locale={locale}
        labels={{
          service: t("columns.service"),
          save: t("actions.save"),
          saving: t("actions.saving"),
          saved: t("actions.saved"),
          saveFailed: t("actions.saveFailed"),
          emptyServices: t("emptyServices"),
          emptyRegions: t("emptyRegions"),
          hint: t("hint"),
        }}
      />
    </div>
  );
}
