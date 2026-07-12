import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { FaqEditorForm } from "@/features/faqs/admin/components/faq-editor-form";
import { faqDetailToEditorValues } from "@/features/faqs/admin/lib/form-defaults";
import { getFaqEditorLabels } from "@/features/faqs/admin/lib/labels";
import { Button } from "@/components/ui/button";
import { adminFaqCategoryRepository } from "@/server/repositories/admin-faq-category-repository";
import { adminFaqRepository } from "@/server/repositories/admin-faq-repository";
import { adminRegionRepository } from "@/server/repositories/admin-region-repository";
import { adminServiceRepository } from "@/server/repositories/admin-service-repository";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

type EditFaqPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.faqs");
  return adminMetadata(t("editTitle"));
}

export default async function EditFaqPage({ params }: EditFaqPageProps) {
  await enforcePermissionAccess("faq:manage")();

  const { id } = await params;
  const locale = "en";
    const t = await getTranslations("admin.faqs");

  const [faq, services, categories, regions, labels] = await Promise.all([
    adminFaqRepository.findById(id),
    adminServiceRepository.listForSelect(),
    adminFaqCategoryRepository.listForSelect(),
    adminRegionRepository.listForSelect(),
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
        regions={regions}
        locale={locale}
        labels={labels}
      />
    </div>
  );
}
