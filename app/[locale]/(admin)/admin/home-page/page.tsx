import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { HomePageSettingsPanel } from "@/features/home-page/admin/components/home-page-settings-panel";
import { HOME_SECTION_KEYS } from "@/features/home-page/lib/defaults";
import { getHomePageSettings } from "@/features/home-page/lib/home-page-settings-cache";
import type { HomeSectionKey } from "@/features/home-page/types";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.homePage");
  return adminMetadata(t("title"));
}

export default async function AdminHomePageSettingsPage() {
  await enforcePermissionAccess("settings:manage")();
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

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
            titleUr: t("fields.titleUr"),
            descriptionEn: t("fields.descriptionEn"),
            descriptionUr: t("fields.descriptionUr"),
            badgeEn: t("fields.badgeEn"),
            badgeUr: t("fields.badgeUr"),
            browseCtaEn: t("fields.browseCtaEn"),
            browseCtaUr: t("fields.browseCtaUr"),
            whatsappCtaEn: t("fields.whatsappCtaEn"),
            whatsappCtaUr: t("fields.whatsappCtaUr"),
            requestCtaEn: t("fields.requestCtaEn"),
            requestCtaUr: t("fields.requestCtaUr"),
            metaTitleEn: t("fields.metaTitleEn"),
            metaTitleUr: t("fields.metaTitleUr"),
            metaDescriptionEn: t("fields.metaDescriptionEn"),
            metaDescriptionUr: t("fields.metaDescriptionUr"),
            h1En: t("fields.h1En"),
            h1Ur: t("fields.h1Ur"),
            footerDescriptionEn: t("fields.footerDescriptionEn"),
            footerDescriptionUr: t("fields.footerDescriptionUr"),
            faqCount: t("fields.faqCount"),
            documentCount: t("fields.documentCount"),
            blogCount: t("fields.blogCount"),
            guideCount: t("fields.guideCount"),
            popularCount: t("fields.popularCount"),
          },
          sectionLabels,
        }}
      />
    </div>
  );
}
