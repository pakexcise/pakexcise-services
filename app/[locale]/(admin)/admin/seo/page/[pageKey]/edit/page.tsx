import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { emptySeoInput, seoFromRecord } from "@/features/cms/lib/default-seo";
import { LegalPageEditorForm } from "@/features/seo/admin/components/legal-page-editor-form";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { legalPageKeys, type LegalPageKey } from "@/lib/validations/admin-page-content";
import { adminPageContentRepository } from "@/server/repositories/admin-page-content-repository";
import { adminSeoRepository } from "@/server/repositories/admin-seo-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";

type LegalEditPageProps = {
  params: Promise<{ pageKey: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return adminMetadata("Edit legal page");
}

export default async function AdminLegalPageEditPage({ params }: LegalEditPageProps) {
  const { pageKey } = await params;

  if (!legalPageKeys.includes(pageKey as LegalPageKey)) {
    notFound();
  }

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.resources.seo");

  const [content, seo] = await Promise.all([
    adminPageContentRepository.getByPageKey(pageKey),
    adminSeoRepository.findByPageKey(pageKey),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Edit ${pageKey} page`}
        description={t("description")}
      />
      <LegalPageEditorForm
        pageKey={pageKey as LegalPageKey}
        initialValues={{
          titleEn: content?.titleEn ?? "",
          titleUr: content?.titleUr ?? "",
          excerptEn: content?.excerptEn ?? "",
          excerptUr: content?.excerptUr ?? "",
          contentEn: content?.contentEn ?? "",
          contentUr: content?.contentUr ?? "",
          seo: seo ? seoFromRecord(seo) : { ...emptySeoInput },
        }}
      />
    </div>
  );
}
