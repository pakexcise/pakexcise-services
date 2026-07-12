import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { emptySeoInput } from "@/features/cms/lib/default-seo";
import { LegalPageEditorForm } from "@/features/legal-pages/admin/components/legal-page-editor-form";
import { getLegalPageEditorLabels } from "@/features/legal-pages/admin/lib/editor-labels";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { adminLegalPageRepository } from "@/server/repositories/admin-legal-page-repository";
import { requireSuperAdmin } from "@/server/permissions/guards";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.resources.legalPages");
  return adminMetadata(t("createTitle"));
}

export default async function AdminLegalPageCreatePage() {
  await requireSuperAdmin();

  const locale = "en";
    const t = await getTranslations("admin.resources.legalPages");
  const labels = await getLegalPageEditorLabels();
  const nextDisplayOrder = await adminLegalPageRepository.getNextDisplayOrder();

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("createTitle")} description={t("createDescription")} />
      <LegalPageEditorForm
        mode="create"
        initialValues={{
          slug: "",
          titleEn: "",
          excerptEn: "",
          contentEn: "",
          isPublished: false,
          isActive: true,
          displayOrder: nextDisplayOrder,
          seo: { ...emptySeoInput },
        }}
        labels={labels}
      />
    </div>
  );
}
