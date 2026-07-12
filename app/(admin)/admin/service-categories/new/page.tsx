import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { ServiceCategoryEditorForm } from "@/features/service-categories/admin/components/category-editor-form";
import { emptyServiceCategoryEditorValues } from "@/features/service-categories/admin/lib/form-defaults";
import { adminServiceCategoryRepository } from "@/server/repositories/admin-service-category-repository";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.serviceCategories");
  return adminMetadata(t("createTitle"));
}

export default async function NewServiceCategoryPage() {
  await enforcePermissionAccess("service:manage")();

  const locale = "en";
    const t = await getTranslations("admin.serviceCategories");
  const tForm = await getTranslations("admin.serviceCategories.form");

  const displayOrder = await adminServiceCategoryRepository.getNextDisplayOrder();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("createTitle")}
        description={t("createDescription")}
      />
      <ServiceCategoryEditorForm
        mode="create"
        initialValues={emptyServiceCategoryEditorValues(displayOrder)}
        labels={{
          slug: tForm("slug"),
          nameEn: tForm("nameEn"),
          descriptionEn: tForm("descriptionEn"),
          isActive: tForm("isActive"),
          displayOrder: tForm("displayOrder"),
          save: tForm("save"),
          saving: tForm("saving"),
          saveFailed: tForm("saveFailed"),
        }}
      />
    </div>
  );
}
