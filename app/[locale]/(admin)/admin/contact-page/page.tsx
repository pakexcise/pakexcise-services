import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { ContactPageSettingsPanel } from "@/features/contact-page/admin/components/contact-page-settings-panel";
import { getContactPageSettings } from "@/features/contact-page/lib/contact-page-settings-cache";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.contactPage");
  return adminMetadata(t("title"));
}

export default async function AdminContactPageSettingsPage() {
  await enforcePermissionAccess("settings:manage")();
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("admin.contactPage");
  const settings = await getContactPageSettings();

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <ContactPageSettingsPanel
        initialValues={settings}
        labels={{
          save: t("save"),
          saving: t("saving"),
          saved: t("saved"),
          error: t("error"),
          tabs: {
            hero: t("tabs.hero"),
            contact: t("tabs.contact"),
            cards: t("tabs.cards"),
            form: t("tabs.form"),
            cta: t("tabs.cta"),
            seo: t("tabs.seo"),
          },
          fields: {
            pageActive: t("fields.pageActive"),
            heroTitleEn: t("fields.heroTitleEn"),
            heroTitleUr: t("fields.heroTitleUr"),
            heroDescriptionEn: t("fields.heroDescriptionEn"),
            heroDescriptionUr: t("fields.heroDescriptionUr"),
            phoneNumber: t("fields.phoneNumber"),
            whatsappNumber: t("fields.whatsappNumber"),
            supportEmail: t("fields.supportEmail"),
            supportDaysEn: t("fields.supportDaysEn"),
            supportDaysUr: t("fields.supportDaysUr"),
            supportHoursEn: t("fields.supportHoursEn"),
            supportHoursUr: t("fields.supportHoursUr"),
            whatsappChannelUrl: t("fields.whatsappChannelUrl"),
            whatsappPrefillMessage: t("fields.whatsappPrefillMessage"),
            cardActive: t("fields.cardActive"),
            cardTitleEn: t("fields.cardTitleEn"),
            cardTitleUr: t("fields.cardTitleUr"),
            cardDescriptionEn: t("fields.cardDescriptionEn"),
            cardDescriptionUr: t("fields.cardDescriptionUr"),
            cardButtonEn: t("fields.cardButtonEn"),
            cardButtonUr: t("fields.cardButtonUr"),
            supportHoursCardTitleEn: t("fields.supportHoursCardTitleEn"),
            supportHoursCardTitleUr: t("fields.supportHoursCardTitleUr"),
            formHeadingEn: t("fields.formHeadingEn"),
            formHeadingUr: t("fields.formHeadingUr"),
            formDescriptionEn: t("fields.formDescriptionEn"),
            formDescriptionUr: t("fields.formDescriptionUr"),
            socialHeadingEn: t("fields.socialHeadingEn"),
            socialHeadingUr: t("fields.socialHeadingUr"),
            socialDescriptionEn: t("fields.socialDescriptionEn"),
            socialDescriptionUr: t("fields.socialDescriptionUr"),
            ctaActive: t("fields.ctaActive"),
            ctaTitleEn: t("fields.ctaTitleEn"),
            ctaTitleUr: t("fields.ctaTitleUr"),
            ctaDescriptionEn: t("fields.ctaDescriptionEn"),
            ctaDescriptionUr: t("fields.ctaDescriptionUr"),
            ctaViewServicesEn: t("fields.ctaViewServicesEn"),
            ctaViewServicesUr: t("fields.ctaViewServicesUr"),
            ctaWhatsappEn: t("fields.ctaWhatsappEn"),
            ctaWhatsappUr: t("fields.ctaWhatsappUr"),
            metaTitleEn: t("fields.metaTitleEn"),
            metaTitleUr: t("fields.metaTitleUr"),
            metaDescriptionEn: t("fields.metaDescriptionEn"),
            metaDescriptionUr: t("fields.metaDescriptionUr"),
          },
        }}
      />
    </div>
  );
}
