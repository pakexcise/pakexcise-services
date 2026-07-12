import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { CityEditorForm } from "@/features/cities/admin/components/city-editor-form";
import { cityToEditorValues } from "@/features/cities/admin/lib/form-defaults";
import { adminCityRepository } from "@/server/repositories/admin-city-repository";
import { adminRegionRepository } from "@/server/repositories/admin-region-repository";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

type EditCityPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.cities");
  return adminMetadata(t("editTitle"));
}

export default async function EditCityPage({ params }: EditCityPageProps) {
  await enforcePermissionAccess("region:manage")();

  const { id } = await params;
  const locale = "en";
    const t = await getTranslations("admin.cities");

  const [city, regions] = await Promise.all([
    adminCityRepository.findById(id),
    adminRegionRepository.listOptions(),
  ]);

  if (!city) {
    notFound();
  }

  const labels = {
    tabGeneral: t("form.tabs.general"),
    tabSeo: t("form.tabs.seo"),
    region: t("form.region"),
    slug: t("form.slug"),
    nameEn: t("form.nameEn"),
    descriptionEn: t("form.descriptionEn"),
    isActive: t("form.isActive"),
    displayOrder: t("form.displayOrder"),
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
        title={t("editTitle")}
        description={t("editDescription", {
          name: city.nameEn,
        })}
      />
      <CityEditorForm
        mode="edit"
        cityId={city.id}
        initialValues={cityToEditorValues(city)}
        regions={regions}
        locale={locale}
        labels={labels}
      />
    </div>
  );
}
