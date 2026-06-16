import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { CityEditorForm } from "@/features/cities/admin/components/city-editor-form";
import { emptyCityEditorValues } from "@/features/cities/admin/lib/form-defaults";
import { adminRegionRepository } from "@/server/repositories/admin-region-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

type NewCityPageProps = {
  searchParams: Promise<{ regionId?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.cities");
  return adminMetadata(t("createTitle"));
}

export default async function NewCityPage({ searchParams }: NewCityPageProps) {
  await enforcePermissionAccess("region:manage")();

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.cities");
  const params = await searchParams;

  const regions = await adminRegionRepository.listOptions();
  const initialValues = emptyCityEditorValues();

  if (params.regionId) {
    initialValues.regionId = params.regionId;
  }

  const labels = {
    tabGeneral: t("form.tabs.general"),
    tabSeo: t("form.tabs.seo"),
    region: t("form.region"),
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
      <CityEditorForm
        mode="create"
        initialValues={initialValues}
        regions={regions}
        locale={locale}
        labels={labels}
      />
    </div>
  );
}
