import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { FaqCategoryDeleteButton } from "@/features/faq-categories/admin/components/category-delete-button";
import { FaqCategoryEditorForm } from "@/features/faq-categories/admin/components/category-editor-form";
import { faqCategoryDetailToEditorValues } from "@/features/faq-categories/admin/lib/form-defaults";
import { Button } from "@/components/ui/button";
import { adminFaqCategoryRepository } from "@/server/repositories/admin-faq-category-repository";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

type EditFaqCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.faqCategories");
  return adminMetadata(t("editTitle"));
}

export default async function EditFaqCategoryPage({
  params,
}: EditFaqCategoryPageProps) {
  await enforcePermissionAccess("faq:manage")();

  const { id } = await params;
  const locale = "en";
    const t = await getTranslations("admin.faqCategories");

  const category = await adminFaqCategoryRepository.findById(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("editTitle")}
        description={t("editDescription", {
          name: category.nameEn,
        })}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/faq-categories">{t("backToList")}</Link>
            </Button>
            <FaqCategoryDeleteButton
              categoryId={category.id}
              faqCount={category._count.faqs}
              labels={{
                delete: t("actions.delete"),
                confirmDelete: t("actions.confirmDelete"),
                deleteBlocked: t("actions.deleteBlocked"),
              }}
            />
          </div>
        }
      />
      <FaqCategoryEditorForm
        mode="edit"
        categoryId={category.id}
        initialValues={faqCategoryDetailToEditorValues(category)}
        labels={{
          slug: t("form.slug"),
          nameEn: t("form.nameEn"),
          descriptionEn: t("form.descriptionEn"),
          isActive: t("form.isActive"),
          displayOrder: t("form.displayOrder"),
          save: t("form.save"),
          saving: t("form.saving"),
          saveFailed: t("form.saveFailed"),
          cancel: t("form.cancel"),
        }}
      />
    </div>
  );
}
