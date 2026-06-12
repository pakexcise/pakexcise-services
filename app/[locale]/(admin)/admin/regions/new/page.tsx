import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { RegionEditorForm } from "@/features/regions/admin/components/region-editor-form";
import { emptyRegionEditorValues } from "@/features/regions/admin/lib/form-defaults";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.regions");
  return adminMetadata(t("createTitle"));
}

export default async function NewRegionPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.regions");

  const labels = {
    tabGeneral: t("form.tabs.general"),
    tabSeo: t("form.tabs.seo"),
    slug: t("form.slug"),
    nameEn: t("form.nameEn"),
    nameUr: t("form.nameUr"),
    descriptionEn: t("form.descriptionEn"),
    descriptionUr: t("form.descriptionUr"),
    isActive: t("form.isActive"),
    displayOrder: t("form.displayOrder"),
    metaTitleEn: t("form.metaTitleEn"),
    metaTitleUr: t("form.metaTitleUr"),
    metaDescriptionEn: t("form.metaDescriptionEn"),
    metaDescriptionUr: t("form.metaDescriptionUr"),
    h1En: t("form.h1En"),
    h1Ur: t("form.h1Ur"),
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
