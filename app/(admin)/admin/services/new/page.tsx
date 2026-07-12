import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { ServiceEditorForm } from "@/features/services/admin/components/service-editor-form";
import {
  emptyServiceEditorValues,
} from "@/features/services/admin/lib/form-defaults";
import { getServiceEditorLabels } from "@/features/services/admin/lib/labels";
import {
  adminServiceRepository,
} from "@/server/repositories/admin-service-repository";
import { adminServiceCategoryRepository } from "@/server/repositories/admin-service-category-repository";
import { regionRepository, serviceRepository } from "@/server/repositories";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.services");
  return adminMetadata(t("createTitle"));
}

export default async function NewServicePage() {
  const locale = "en";
    const t = await getTranslations("admin.services");

  const [regions, categories, parentServices, nextOrder, labels] =
    await Promise.all([
      regionRepository.listAdmin(),
      adminServiceCategoryRepository.listAdmin(),
      serviceRepository.listParentOptions(),
      adminServiceRepository.getNextDisplayOrder(),
      getServiceEditorLabels(),
    ]);

  const defaultRegionIds = regions[0]?.id ? [regions[0].id] : [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("createTitle")}
        description={t("createDescription")}
      />
      <ServiceEditorForm
        mode="create"
        initialValues={emptyServiceEditorValues(defaultRegionIds, nextOrder)}
        regions={regions}
        categories={categories}
        parentServices={parentServices}
        labels={labels}
      />
    </div>
  );
}
