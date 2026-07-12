import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { ContactPageSettingsPanel } from "@/features/contact-page/admin/components/contact-page-settings-panel";
import { getContactPageSettings } from "@/features/contact-page/lib/contact-page-settings-cache";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.contactPage");
  return adminMetadata(t("title"));
}

export default async function AdminContactPageSettingsPage() {
  await enforcePermissionAccess("settings:manage")();
  const locale = "en";
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
            heroDescriptionEn: t("fields.heroDescriptionEn"),
            phoneNumber: t("fields.phoneNumber"),
            whatsappNumber: t("fields.whatsappNumber"),
            supportEmail: t("fields.supportEmail"),
            supportDaysEn: t("fields.supportDaysEn"),
            supportHoursEn: t("fields.supportHoursEn"),
            whatsappChannelUrl: t("fields.whatsappChannelUrl"),
            whatsappPrefillMessage: t("fields.whatsappPrefillMessage"),
            cardActive: t("fields.cardActive"),
            cardTitleEn: t("fields.cardTitleEn"),
            cardDescriptionEn: t("fields.cardDescriptionEn"),
            cardButtonEn: t("fields.cardButtonEn"),
            supportHoursCardTitleEn: t("fields.supportHoursCardTitleEn"),
            formHeadingEn: t("fields.formHeadingEn"),
            formDescriptionEn: t("fields.formDescriptionEn"),
            socialHeadingEn: t("fields.socialHeadingEn"),
            socialDescriptionEn: t("fields.socialDescriptionEn"),
            ctaActive: t("fields.ctaActive"),
            ctaTitleEn: t("fields.ctaTitleEn"),
            ctaDescriptionEn: t("fields.ctaDescriptionEn"),
            ctaViewServicesEn: t("fields.ctaViewServicesEn"),
            ctaWhatsappEn: t("fields.ctaWhatsappEn"),
            metaTitleEn: t("fields.metaTitleEn"),
            metaDescriptionEn: t("fields.metaDescriptionEn"),
          },
        }}
      />
    </div>
  );
}
