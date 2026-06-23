import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { emptySeoInput, seoFromRecord } from "@/features/cms/lib/default-seo";
import { LegalPageEditorForm } from "@/features/legal-pages/admin/components/legal-page-editor-form";
import { getLegalPageEditorLabels } from "@/features/legal-pages/admin/lib/editor-labels";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { legalPagePath } from "@/features/legal-pages/lib/constants";
import { adminLegalPageRepository } from "@/server/repositories/admin-legal-page-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { requireSuperAdmin } from "@/server/permissions/guards";
import { Link } from "@/i18n/navigation";

type AdminLegalPageEditPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.resources.legalPages");
  return adminMetadata(t("editTitle"));
}

export default async function AdminLegalPageEditPage({
  params,
}: AdminLegalPageEditPageProps) {
  await requireSuperAdmin();

  const { id } = await params;
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.resources.legalPages");
  const labels = await getLegalPageEditorLabels();

  const page = await adminLegalPageRepository.findById(id);
  if (!page) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("editTitle")}
        description={t("editDescription", { title: page.titleEn })}
        actions={
          <Link
            href={legalPagePath(page.slug)}
            target="_blank"
            className="text-sm font-medium text-primary hover:underline"
          >
            {t("viewPublic")}
          </Link>
        }
      />
      <LegalPageEditorForm
        mode="edit"
        pageId={page.id}
        initialValues={{
          slug: page.slug,
          titleEn: page.titleEn,
          titleUr: page.titleUr,
          excerptEn: page.excerptEn ?? "",
          excerptUr: page.excerptUr ?? "",
          contentEn: page.contentEn,
          contentUr: page.contentUr,
          isPublished: page.isPublished,
          isActive: page.isActive,
          displayOrder: page.displayOrder,
          seo: page.seoMeta ? seoFromRecord(page.seoMeta) : { ...emptySeoInput },
        }}
        labels={labels}
      />
    </div>
  );
}
