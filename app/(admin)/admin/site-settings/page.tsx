import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { SiteSettingsPanel } from "@/features/settings/admin/components/site-settings-panel";
import { snapshotToFormValues } from "@/features/settings/admin/lib/global-site-form";
import { SocialLinksPanel } from "@/features/social/admin/components/social-links-panel";
import { getSocialPanelLabels } from "@/features/social/admin/lib/labels";
import { loadAdminSettingsSnapshot } from "@/server/repositories/admin-settings-repository";
import { adminSocialRepository } from "@/server/repositories/admin-social-repository";
import { requireSuperAdmin } from "@/server/permissions/guards";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.siteSettings");
  return adminMetadata(t("title"));
}

export default async function AdminSiteSettingsPage() {
  await requireSuperAdmin();

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
              supportDaysEn: t("contact.supportDaysEn"),
              supportHoursEn: t("contact.supportHoursEn"),
              whatsappChannelUrl: t("contact.whatsappChannelUrl"),
            },
            header: {
              headerWhatsappEnabled: t("header.headerWhatsappEnabled"),
              headerWhatsappLabelEn: t("header.headerWhatsappLabelEn"),
              announcementBarEnabled: t("header.announcementBarEnabled"),
              announcementBarTextEn: t("header.announcementBarTextEn"),
              defaultApplyCtaTextEn: t("header.defaultApplyCtaTextEn"),
              defaultSubmitRequestCtaTextEn: t("header.defaultSubmitRequestCtaTextEn"),
            },
            fab: {
              floatingWhatsappMessageEn: t("fab.floatingWhatsappMessageEn"),
              floatingWhatsappPosition: t("fab.floatingWhatsappPosition"),
              positionBottomRight: t("fab.positionBottomRight"),
              positionBottomLeft: t("fab.positionBottomLeft"),
              featureFlagNote: t("fab.featureFlagNote"),
            },
            contactForm: {
              contactRecipientEmail: t("contactForm.contactRecipientEmail"),
              contactSuccessMessageEn: t("contactForm.contactSuccessMessageEn"),
              contactAdminNotificationEnabled: t("contactForm.contactAdminNotificationEnabled"),
              contactAutoReplyEnabled: t("contactForm.contactAutoReplyEnabled"),
              featureFlagNote: t("contactForm.featureFlagNote"),
            },
            submitRequest: {
              submitRequestSuccessMessageEn: t("submitRequest.submitRequestSuccessMessageEn"),
              submitRequestSaveToSupportRequests: t(
                "submitRequest.submitRequestSaveToSupportRequests",
              ),
              submitRequestNotifyAdminEnabled: t(
                "submitRequest.submitRequestNotifyAdminEnabled",
              ),
              submitRequestAutoReplyEnabled: t(
                "submitRequest.submitRequestAutoReplyEnabled",
              ),
              featureFlagNote: t("submitRequest.featureFlagNote"),
            },
            footer: {
              footerDescriptionEn: t("footer.footerDescriptionEn"),
              footerWhatsappLabelEn: t("footer.footerWhatsappLabelEn"),
              footerWhatsappChannelLabelEn: t("footer.footerWhatsappChannelLabelEn"),
              disclaimerEn: t("footer.disclaimerEn"),
              catalogNote: t("footer.catalogNote"),
            },
            branding: {
              logoPath: t("branding.logoPath"),
              logoDarkPath: t("branding.logoDarkPath"),
              footerLogoPath: t("branding.footerLogoPath"),
              logoIconPath: t("branding.logoIconPath"),
              faviconPath: t("branding.faviconPath"),
              appleIconPath: t("branding.appleIconPath"),
              defaultOgImagePath: t("branding.defaultOgImagePath"),
              defaultTwitterImagePath: t("branding.defaultTwitterImagePath"),
              defaultBlogFallbackImagePath: t("branding.defaultBlogFallbackImagePath"),
              defaultServiceFallbackImagePath: t("branding.defaultServiceFallbackImagePath"),
              defaultRegionFallbackImagePath: t("branding.defaultRegionFallbackImagePath"),
              primaryBrandColor: t("branding.primaryBrandColor"),
              secondaryBrandColor: t("branding.secondaryBrandColor"),
              upload: t("branding.upload"),
              uploading: t("branding.uploading"),
              uploadHint: t("branding.uploadHint"),
              previewAlt: t("branding.previewAlt"),
              uploadError: t("branding.uploadError"),
              invalidType: t("branding.invalidType"),
              tooLarge: t("branding.tooLarge"),
              invalidName: t("branding.invalidName"),
              unresolvedPreview: t("branding.unresolvedPreview"),
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
