import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { RegionCitiesPanel } from "@/features/regions/admin/components/region-cities-panel";
import { RegionEditorForm } from "@/features/regions/admin/components/region-editor-form";
import { regionToEditorValues } from "@/features/regions/admin/lib/form-defaults";
import { adminCityRepository } from "@/server/repositories/admin-city-repository";
import { adminRegionRepository } from "@/server/repositories/admin-region-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";

type EditRegionPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.regions");
  return adminMetadata(t("editTitle"));
}

export default async function EditRegionPage({ params }: EditRegionPageProps) {
  const { id } = await params;
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.regions");

  const region = await adminRegionRepository.findById(id);

  if (!region) {
    notFound();
  }

  const cities = await adminCityRepository.listByRegionId(region.id);

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
        title={t("editTitle")}
        description={t("editDescription", {
          name: locale === "ur" ? region.nameUr : region.nameEn,
        })}
      />
      <RegionEditorForm
        mode="edit"
        regionId={region.id}
        initialValues={regionToEditorValues(region)}
        labels={labels}
      />
      <RegionCitiesPanel
        regionId={region.id}
        cities={cities}
        labels={{
          title: t("cities.title"),
          addCity: t("cities.add"),
          slug: t("cities.slug"),
          nameEn: t("cities.nameEn"),
          nameUr: t("cities.nameUr"),
          descriptionEn: t("cities.descriptionEn"),
          isActive: t("cities.isActive"),
          save: t("cities.save"),
          saving: t("cities.saving"),
          delete: t("cities.delete"),
          confirmDelete: t("cities.confirmDelete"),
          active: t("status.active"),
          inactive: t("status.inactive"),
          empty: t("cities.empty"),
        }}
      />
    </div>
  );
}
