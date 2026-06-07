import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { FaqEditorForm } from "@/features/faqs/admin/components/faq-editor-form";
import { emptyFaqEditorValues } from "@/features/faqs/admin/lib/form-defaults";
import { getFaqEditorLabels } from "@/features/faqs/admin/lib/labels";
import { adminFaqRepository } from "@/server/repositories/admin-faq-repository";
import { adminServiceRepository } from "@/server/repositories/admin-service-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.faqs");
  return adminMetadata(t("createTitle"));
}

export default async function NewFaqPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.faqs");

  const [services, categories, nextOrder, labels] = await Promise.all([
    adminServiceRepository.listForSelect(),
    adminFaqRepository.listCategories(),
    adminFaqRepository.getNextDisplayOrder(),
    getFaqEditorLabels(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("createTitle")}
        description={t("createDescription")}
      />
      <FaqEditorForm
        mode="create"
        initialValues={emptyFaqEditorValues(nextOrder)}
        services={services}
        categories={categories}
        labels={labels}
      />
    </div>
  );
}
