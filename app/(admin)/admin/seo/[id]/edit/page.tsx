import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { seoFromRecord } from "@/features/cms/lib/default-seo";
import { SeoMetaEditorForm } from "@/features/seo/admin/components/seo-meta-editor-form";
import { resolveSeoLinkedEntity } from "@/features/seo/admin/lib/seo-linked-entity";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { adminSeoRepository } from "@/server/repositories/admin-seo-repository";
import { enforcePlatformManageAccess } from "@/server/permissions/platform-access";

type EditSeoMetaPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.resources.seo");
  return adminMetadata(`${t("editTitle")} | ${t("title")}`);
}

export default async function AdminSeoMetaEditPage({
  params,
}: EditSeoMetaPageProps) {
  await enforcePlatformManageAccess();

  const t = await getTranslations("admin.resources.seo");
  const { id } = await params;
  const record = await adminSeoRepository.findByIdForEdit(id);
  if (!record) notFound();

  const linked = resolveSeoLinkedEntity(record);
  const initialValues = seoFromRecord({
    ...record,
    focusKeywords:
      record.focusKeywords?.trim() ||
      record.blogPost?.focusKeywords?.trim() ||
      null,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("editTitle")}
        description={t("editDescription")}
      />
      <SeoMetaEditorForm
        seoId={record.id}
        pageKey={record.pageKey}
        linkedEntityLabel={linked.label}
        sourceEditHref={linked.href}
        initialValues={initialValues}
        labels={{
          save: t("save"),
          cancel: t("cancel"),
          saving: t("saving"),
          pageKey: t("columns.pageKey"),
          linkedEntity: t("columns.linkedEntity"),
          openSource: t("openSource"),
          sectionTitle: t("form.sectionTitle"),
          metaTitleEn: t("form.metaTitleEn"),
          metaDescriptionEn: t("form.metaDescriptionEn"),
          h1En: t("form.h1En"),
          focusKeywords: t("form.focusKeywords"),
          focusKeywordsHint: t("form.focusKeywordsHint"),
          canonicalUrl: t("form.canonicalUrl"),
          ogTitleEn: t("form.ogTitleEn"),
          ogDescriptionEn: t("form.ogDescriptionEn"),
          ogImage: t("form.ogImage"),
          twitterCard: t("form.twitterCard"),
          robotsIndex: t("form.robotsIndex"),
          robotsFollow: t("form.robotsFollow"),
        }}
      />
    </div>
  );
}
