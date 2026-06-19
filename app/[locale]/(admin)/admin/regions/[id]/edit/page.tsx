import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { RegionCitiesPanel } from "@/features/regions/admin/components/region-cities-panel";
import { RegionEditorForm } from "@/features/regions/admin/components/region-editor-form";
import { RegionPlateFormatsPanel } from "@/features/regions/admin/components/region-plate-formats-panel";
import { regionToEditorValues } from "@/features/regions/admin/lib/form-defaults";
import { adminCityRepository } from "@/server/repositories/admin-city-repository";
import { adminRegionPlateFormatRepository } from "@/server/repositories/admin-region-plate-format-repository";
import { adminRegionRepository } from "@/server/repositories/admin-region-repository";
import { isPlateFormatSchemaReady } from "@/server/db/is-plate-format-schema-ready";
import { prisma } from "@/server/db/prisma";
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

  const plateSchemaReady = isPlateFormatSchemaReady(prisma);

  const [region, cities, plateSection, plateFormats] = await Promise.all([
    adminRegionRepository.findById(id),
    adminCityRepository.listByRegionId(id),
    adminRegionPlateFormatRepository.findSectionByRegionId(id),
    adminRegionPlateFormatRepository.listFormatsByRegionId(id),
  ]);

  if (!region) {
    notFound();
  }

  const regionName = locale === "ur" ? region.nameUr : region.nameEn;
  const plateLabels = {
    title: t("plateFormats.title"),
    description: t("plateFormats.description"),
    sectionSettings: t("plateFormats.sectionSettings"),
    sectionTitleEn: t("plateFormats.sectionTitleEn"),
    sectionTitleUr: t("plateFormats.sectionTitleUr"),
    sectionDescEn: t("plateFormats.sectionDescEn"),
    sectionDescUr: t("plateFormats.sectionDescUr"),
    faqJson: t("plateFormats.faqJson"),
    faqJsonPlaceholder: t("plateFormats.faqJsonPlaceholder"),
    invalidFaqJson: t("plateFormats.invalidFaqJson"),
    saveSection: t("plateFormats.saveSection"),
    formatsList: t("plateFormats.formatsList"),
    addFormat: t("plateFormats.addFormat"),
    newFormat: t("plateFormats.newFormat"),
    editFormat: t("plateFormats.editFormat"),
    vehicleType: t("plateFormats.vehicleType"),
    "vehicleType.CAR": t("plateFormats.vehicleTypes.CAR"),
    "vehicleType.MOTORCYCLE": t("plateFormats.vehicleTypes.MOTORCYCLE"),
    "vehicleType.PUBLIC_TRANSPORT": t("plateFormats.vehicleTypes.PUBLIC_TRANSPORT"),
    "vehicleType.COMMERCIAL": t("plateFormats.vehicleTypes.COMMERCIAL"),
    "vehicleType.GOVERNMENT": t("plateFormats.vehicleTypes.GOVERNMENT"),
    "vehicleType.OTHER": t("plateFormats.vehicleTypes.OTHER"),
    titleEn: t("plateFormats.titleEn"),
    titleUr: t("plateFormats.titleUr"),
    formats: t("plateFormats.formats"),
    formatsPlaceholder: t("plateFormats.formatsPlaceholder"),
    formatsRequired: t("plateFormats.formatsRequired"),
    descriptionEn: t("plateFormats.descriptionEn"),
    descriptionUr: t("plateFormats.descriptionUr"),
    relatedServiceSlugs: t("plateFormats.relatedServiceSlugs"),
    relatedServiceSlugsPlaceholder: t("plateFormats.relatedServiceSlugsPlaceholder"),
    imageAltEn: t("plateFormats.imageAltEn"),
    imageAltUr: t("plateFormats.imageAltUr"),
    imageCaptionEn: t("plateFormats.imageCaptionEn"),
    imageCaptionUr: t("plateFormats.imageCaptionUr"),
    imageUpload: t("plateFormats.imageUpload"),
    imageHint: t("plateFormats.imageHint"),
    removeImage: t("plateFormats.removeImage"),
    saveBeforeUpload: t("plateFormats.saveBeforeUpload"),
    uploadFailed: t("plateFormats.uploadFailed"),
    displayOrder: t("plateFormats.displayOrder"),
    isActive: t("plateFormats.isActive"),
    isFeatured: t("plateFormats.isFeatured"),
    showOnRegionPage: t("plateFormats.showOnRegionPage"),
    saveFormat: t("plateFormats.saveFormat"),
    saving: t("plateFormats.saving"),
    saveFailed: t("plateFormats.saveFailed"),
    delete: t("plateFormats.delete"),
    confirmDelete: t("plateFormats.confirmDelete"),
    deleteFailed: t("plateFormats.deleteFailed"),
    edit: t("plateFormats.edit"),
    inactive: t("status.inactive"),
    empty: t("plateFormats.empty"),
    schemaNotReady: t("plateFormats.schemaNotReady"),
  };

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
      <RegionPlateFormatsPanel
        regionId={region.id}
        regionName={regionName}
        section={plateSection}
        formats={plateFormats}
        schemaReady={plateSchemaReady}
        labels={plateLabels}
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
          edit: t("actions.edit"),
        }}
      />
    </div>
  );
}
