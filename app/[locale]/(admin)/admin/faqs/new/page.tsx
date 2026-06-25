import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { FaqEditorForm } from "@/features/faqs/admin/components/faq-editor-form";
import { emptyFaqEditorValues } from "@/features/faqs/admin/lib/form-defaults";
import { getFaqEditorLabels } from "@/features/faqs/admin/lib/labels";
import { adminFaqCategoryRepository } from "@/server/repositories/admin-faq-category-repository";
import { adminFaqRepository } from "@/server/repositories/admin-faq-repository";
import { adminRegionRepository } from "@/server/repositories/admin-region-repository";
import { adminServiceRepository } from "@/server/repositories/admin-service-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.faqs");
  return adminMetadata(t("createTitle"));
}

export default async function NewFaqPage() {
  await enforcePermissionAccess("faq:manage")();

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.faqs");

  const [services, categories, regions, nextOrder, labels] = await Promise.all([
    adminServiceRepository.listForSelect(),
    adminFaqCategoryRepository.listActiveForSelect(),
    adminRegionRepository.listForSelect(),
    adminFaqRepository.getNextDisplayOrder(),
    getFaqEditorLabels(),
  ]);

  const defaultCategoryId =
    categories.find((category) => category.slug === "general")?.id ??
    categories[0]?.id ??
    "";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("createTitle")}
        description={t("createDescription")}
      />
      <FaqEditorForm
        mode="create"
        initialValues={emptyFaqEditorValues(nextOrder, defaultCategoryId)}
        services={services}
        categories={categories}
        regions={regions}
        locale={locale}
        labels={labels}
      />
    </div>
  );
}
