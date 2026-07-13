import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { HomePageSettingsPanel } from "@/features/home-page/admin/components/home-page-settings-panel";
import { HOME_SECTION_KEYS } from "@/features/home-page/lib/defaults";
import { getHomePageSettings } from "@/features/home-page/lib/home-page-settings-cache";
import type { HomeSectionKey } from "@/features/home-page/types";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.homePage");
  return adminMetadata(t("title"));
}

export default async function AdminHomePageSettingsPage() {
  await enforcePermissionAccess("settings:manage")();
  const locale = "en";
    const t = await getTranslations("admin.homePage");
  const settings = await getHomePageSettings();

  const sectionLabels = Object.fromEntries(
    HOME_SECTION_KEYS.map((key) => [key, t(`sections.${key}`)]),
  ) as Record<HomeSectionKey, string>;

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <HomePageSettingsPanel
        initialValues={settings}
        labels={{
          save: t("save"),
          saving: t("saving"),
          saved: t("saved"),
          error: t("error"),
          tabs: {
            hero: t("tabs.hero"),
            sections: t("tabs.sections"),
            content: t("tabs.content"),
            limits: t("tabs.limits"),
            seo: t("tabs.seo"),
          },
          fields: {
            pageActive: t("fields.pageActive"),
            sectionActive: t("fields.sectionActive"),
            displayOrder: t("fields.displayOrder"),
            titleEn: t("fields.titleEn"),
            descriptionEn: t("fields.descriptionEn"),
            badgeEn: t("fields.badgeEn"),
            browseCtaEn: t("fields.browseCtaEn"),
            whatsappCtaEn: t("fields.whatsappCtaEn"),
            requestCtaEn: t("fields.requestCtaEn"),
            metaTitleEn: t("fields.metaTitleEn"),
            metaDescriptionEn: t("fields.metaDescriptionEn"),
            h1En: t("fields.h1En"),
            footerDescriptionEn: t("fields.footerDescriptionEn"),
            faqCount: t("fields.faqCount"),
            documentCount: t("fields.documentCount"),
            blogCount: t("fields.blogCount"),
            popularCount: t("fields.popularCount"),
          },
          sectionLabels,
        }}
      />
    </div>
  );
}
