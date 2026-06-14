import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { GuideEditorForm } from "@/features/guides/admin/components/guide-editor-form";
import { seoFromRecord } from "@/features/cms/lib/default-seo";
import { loadCmsEditorOptions } from "@/features/cms/lib/load-editor-options";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { adminGuideRepository } from "@/server/repositories/admin-guide-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { enforcePlatformManageAccess } from "@/server/permissions/platform-access";

type EditGuidePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.resources.guides");
  return adminMetadata(`Edit | ${t("title")}`);
}

export default async function AdminGuideEditPage({ params }: EditGuidePageProps) {
  await enforcePlatformManageAccess();

  const { id } = await params;
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.resources.guides");

  const [guide, options] = await Promise.all([
    adminGuideRepository.findById(id),
    loadCmsEditorOptions(),
  ]);

  if (!guide) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader title={`Edit: ${guide.titleEn}`} description={t("description")} />
      <GuideEditorForm
        mode="edit"
        guideId={guide.id}
        initialValues={{
          slug: guide.slug,
          titleEn: guide.titleEn,
          titleUr: guide.titleUr,
          excerptEn: guide.excerptEn ?? "",
          excerptUr: guide.excerptUr ?? "",
          contentEn: guide.contentEn,
          contentUr: guide.contentUr,
          relatedServiceIds: guide.relatedServiceIds,
          attachedFaqIds: guide.attachedFaqIds,
          isPublished: guide.isPublished,
          seo: seoFromRecord(guide.seoMeta),
        }}
        services={options.services}
        faqs={options.faqs}
      />
    </div>
  );
}
