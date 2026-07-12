import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { RegionEditorForm } from "@/features/regions/admin/components/region-editor-form";
import { emptyRegionEditorValues } from "@/features/regions/admin/lib/form-defaults";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.regions");
  return adminMetadata(t("createTitle"));
}

export default async function NewRegionPage() {
  const locale = "en";
    const t = await getTranslations("admin.regions");

  const labels = {
    tabGeneral: t("form.tabs.general"),
    tabSeo: t("form.tabs.seo"),
    slug: t("form.slug"),
    nameEn: t("form.nameEn"),
    descriptionEn: t("form.descriptionEn"),
    isActive: t("form.isActive"),
    showInFooter: t("form.showInFooter"),
    displayOrder: t("form.displayOrder"),
    footerDisplayOrder: t("form.footerDisplayOrder"),
    metaTitleEn: t("form.metaTitleEn"),
    metaDescriptionEn: t("form.metaDescriptionEn"),
    h1En: t("form.h1En"),
    save: t("form.save"),
    saving: t("form.saving"),
    saveFailed: t("form.saveFailed"),
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("createTitle")}
        description={t("createDescription")}
      />
      <RegionEditorForm
        mode="create"
        initialValues={emptyRegionEditorValues()}
        labels={labels}
      />
    </div>
  );
}
