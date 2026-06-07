import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { FaqEditorForm } from "@/features/faqs/admin/components/faq-editor-form";
import { faqDetailToEditorValues } from "@/features/faqs/admin/lib/form-defaults";
import { getFaqEditorLabels } from "@/features/faqs/admin/lib/labels";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { adminFaqRepository } from "@/server/repositories/admin-faq-repository";
import { adminServiceRepository } from "@/server/repositories/admin-service-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";

type EditFaqPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.faqs");
  return adminMetadata(t("editTitle"));
}

export default async function EditFaqPage({ params }: EditFaqPageProps) {
  const { id } = await params;
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.faqs");

  const [faq, services, categories, labels] = await Promise.all([
    adminFaqRepository.findById(id),
    adminServiceRepository.listForSelect(),
    adminFaqRepository.listCategories(),
    getFaqEditorLabels(),
  ]);

  if (!faq) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("editTitle")}
        description={t("editDescription")}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/faqs">{t("backToList")}</Link>
          </Button>
        }
      />
      <FaqEditorForm
        mode="edit"
        faqId={faq.id}
        initialValues={faqDetailToEditorValues(faq)}
        services={services}
        categories={categories}
        labels={labels}
      />
    </div>
  );
}
