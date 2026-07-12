import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { ServiceCategoryEditorForm } from "@/features/service-categories/admin/components/category-editor-form";
import { categoryToEditorValues } from "@/features/service-categories/admin/lib/form-defaults";
import { Button } from "@/components/ui/button";
import { adminServiceCategoryRepository } from "@/server/repositories/admin-service-category-repository";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

type EditServiceCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditServiceCategoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations("admin.serviceCategories");
  return adminMetadata(`${t("editTitle")} ${id.slice(0, 8)}`);
}

export default async function EditServiceCategoryPage({
  params,
}: EditServiceCategoryPageProps) {
  await enforcePermissionAccess("service:manage")();

  const { id } = await params;
  const locale = "en";
    const t = await getTranslations("admin.serviceCategories");
  const tForm = await getTranslations("admin.serviceCategories.form");

  const category = await adminServiceCategoryRepository.findById(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("editTitle")}
        description={category.nameEn}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/service-categories">{t("backToList")}</Link>
          </Button>
        }
      />
      <ServiceCategoryEditorForm
        mode="edit"
        categoryId={category.id}
        initialValues={categoryToEditorValues(category)}
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
