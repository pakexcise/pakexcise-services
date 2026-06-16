import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { SiteSettingsPanel } from "@/features/settings/admin/components/site-settings-panel";
import { snapshotToFormValues } from "@/features/settings/admin/lib/global-site-form";
import { SocialLinksPanel } from "@/features/social/admin/components/social-links-panel";
import { getSocialPanelLabels } from "@/features/social/admin/lib/labels";
import { loadAdminSettingsSnapshot } from "@/server/repositories/admin-settings-repository";
import { adminSocialRepository } from "@/server/repositories/admin-social-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { requireSuperAdmin } from "@/server/permissions/guards";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.siteSettings");
  return adminMetadata(t("title"));
}

export default async function AdminSiteSettingsPage() {
  await requireSuperAdmin();

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.siteSettings");

  const [settings, links, nextDisplayOrder, socialLabels] = await Promise.all([
    loadAdminSettingsSnapshot(),
    adminSocialRepository.listAll(),
    adminSocialRepository.getNextDisplayOrder(),
    getSocialPanelLabels(),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
      />

      <section className="rounded-xl border bg-card p-5">
        <SiteSettingsPanel
          initialValues={snapshotToFormValues(settings)}
          labels={{
            tabs: {
              contact: t("tabs.contact"),
              header: t("tabs.header"),
              fab: t("tabs.fab"),
              contactForm: t("tabs.contactForm"),
              submitRequest: t("tabs.submitRequest"),
              footer: t("tabs.footer"),
              branding: t("tabs.branding"),
            },
            save: t("save"),
            saving: t("saving"),
            saved: t("saved"),
            error: t("error"),
            contact: {
              businessEmail: t("contact.businessEmail"),
              phoneDisplayNumber: t("contact.phoneDisplayNumber"),
              whatsappLinkNumber: t("contact.whatsappLinkNumber"),
              whatsappDefaultMessageEn: t("contact.whatsappDefaultMessageEn"),
              whatsappDefaultMessageUr: t("contact.whatsappDefaultMessageUr"),
              supportDaysEn: t("contact.supportDaysEn"),
              supportDaysUr: t("contact.supportDaysUr"),
              supportHoursEn: t("contact.supportHoursEn"),
              supportHoursUr: t("contact.supportHoursUr"),
              whatsappChannelUrl: t("contact.whatsappChannelUrl"),
            },
            header: {
              headerWhatsappEnabled: t("header.headerWhatsappEnabled"),
              headerWhatsappLabelEn: t("header.headerWhatsappLabelEn"),
              headerWhatsappLabelUr: t("header.headerWhatsappLabelUr"),
              announcementBarEnabled: t("header.announcementBarEnabled"),
              announcementBarTextEn: t("header.announcementBarTextEn"),
              announcementBarTextUr: t("header.announcementBarTextUr"),
              defaultApplyCtaTextEn: t("header.defaultApplyCtaTextEn"),
              defaultApplyCtaTextUr: t("header.defaultApplyCtaTextUr"),
              defaultSubmitRequestCtaTextEn: t("header.defaultSubmitRequestCtaTextEn"),
              defaultSubmitRequestCtaTextUr: t("header.defaultSubmitRequestCtaTextUr"),
            },
            fab: {
              floatingWhatsappMessageEn: t("fab.floatingWhatsappMessageEn"),
              floatingWhatsappMessageUr: t("fab.floatingWhatsappMessageUr"),
              floatingWhatsappPosition: t("fab.floatingWhatsappPosition"),
              positionBottomRight: t("fab.positionBottomRight"),
              positionBottomLeft: t("fab.positionBottomLeft"),
              featureFlagNote: t("fab.featureFlagNote"),
            },
            contactForm: {
              contactRecipientEmail: t("contactForm.contactRecipientEmail"),
              contactSuccessMessageEn: t("contactForm.contactSuccessMessageEn"),
              contactSuccessMessageUr: t("contactForm.contactSuccessMessageUr"),
              contactAdminNotificationEnabled: t("contactForm.contactAdminNotificationEnabled"),
              contactAutoReplyEnabled: t("contactForm.contactAutoReplyEnabled"),
              featureFlagNote: t("contactForm.featureFlagNote"),
            },
            submitRequest: {
              submitRequestSuccessMessageEn: t("submitRequest.submitRequestSuccessMessageEn"),
              submitRequestSuccessMessageUr: t("submitRequest.submitRequestSuccessMessageUr"),
              submitRequestSaveToSupportRequests: t(
                "submitRequest.submitRequestSaveToSupportRequests",
              ),
              submitRequestNotifyAdminEnabled: t(
                "submitRequest.submitRequestNotifyAdminEnabled",
              ),
              featureFlagNote: t("submitRequest.featureFlagNote"),
            },
            footer: {
              footerDescriptionEn: t("footer.footerDescriptionEn"),
              footerDescriptionUr: t("footer.footerDescriptionUr"),
              disclaimerEn: t("footer.disclaimerEn"),
              disclaimerUr: t("footer.disclaimerUr"),
            },
            branding: {
              logoPath: t("branding.logoPath"),
              logoDarkPath: t("branding.logoDarkPath"),
              footerLogoPath: t("branding.footerLogoPath"),
              faviconPath: t("branding.faviconPath"),
              defaultOgImagePath: t("branding.defaultOgImagePath"),
              defaultTwitterImagePath: t("branding.defaultTwitterImagePath"),
              defaultBlogFallbackImagePath: t("branding.defaultBlogFallbackImagePath"),
              defaultGuideFallbackImagePath: t("branding.defaultGuideFallbackImagePath"),
              defaultServiceFallbackImagePath: t("branding.defaultServiceFallbackImagePath"),
              defaultRegionFallbackImagePath: t("branding.defaultRegionFallbackImagePath"),
              primaryBrandColor: t("branding.primaryBrandColor"),
              secondaryBrandColor: t("branding.secondaryBrandColor"),
            },
          }}
        />
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-5">
        <div>
          <h2 className="text-lg font-semibold">{t("social.title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("social.description")}
          </p>
        </div>
        <SocialLinksPanel
          links={links}
          labels={socialLabels}
          nextDisplayOrder={nextDisplayOrder}
        />
      </section>
    </div>
  );
}
