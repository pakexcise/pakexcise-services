import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { FaqCategoryEditorForm } from "@/features/faq-categories/admin/components/category-editor-form";
import { emptyFaqCategoryEditorValues } from "@/features/faq-categories/admin/lib/form-defaults";
import { adminFaqCategoryRepository } from "@/server/repositories/admin-faq-category-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.faqCategories");
  return adminMetadata(t("createTitle"));
}

export default async function NewFaqCategoryPage() {
  await enforcePermissionAccess("faq:manage")();

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.faqCategories");

  const nextOrder = await adminFaqCategoryRepository.getNextDisplayOrder();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("createTitle")}
        description={t("createDescription")}
      />
      <FaqCategoryEditorForm
        mode="create"
        initialValues={emptyFaqCategoryEditorValues(nextOrder)}
        labels={{
          slug: t("form.slug"),
          nameEn: t("form.nameEn"),
          nameUr: t("form.nameUr"),
          descriptionEn: t("form.descriptionEn"),
          descriptionUr: t("form.descriptionUr"),
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
