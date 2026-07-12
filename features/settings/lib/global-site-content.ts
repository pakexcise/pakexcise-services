import type { ContactPageSettings } from "@/features/contact-page/types";
import type {
  BrandingSettings,
  BusinessSettings,
  FormsSettings,
  GlobalSiteSettingsSnapshot,
  PublicUiSettings,
} from "@/features/settings/types";
import {
  resolvePhoneDisplayNumber,
  resolveSupportEmail,
  resolveWhatsappDefaultMessage,
  resolveWhatsappChannelUrl,
  resolveWhatsappLinkNumber,
} from "@/features/settings/lib/resolve-public-contact";

export function overlayGlobalContactOnContactPage(
  contact: ContactPageSettings,
  business: BusinessSettings,
): ContactPageSettings {
  return {
    ...contact,
    phoneNumber: resolvePhoneDisplayNumber(business),
    whatsappNumber: resolveWhatsappLinkNumber(business),
    supportEmail: resolveSupportEmail(business),
    supportDaysEn: business.supportDaysEn,
    supportHoursEn: business.supportHoursEn,
    whatsappChannelUrl: resolveWhatsappChannelUrl(business),
    whatsappPrefillMessage: business.whatsappDefaultMessageEn,
  };
}

export function localizeGlobalSiteContent(
  business: BusinessSettings,
  publicUi?: PublicUiSettings,
) {
  return {
    footerDescription: business.footerDescriptionEn ?? "",
    disclaimer: business.disclaimerEn ?? "",
    supportDays: business.supportDaysEn ?? "",
    supportHours: business.supportHoursEn ?? "",
    businessHours: business.businessHoursEn ?? "",
    whatsappMessage: resolveWhatsappDefaultMessage(business),
    announcementText: publicUi
      ? publicUi.announcementBarTextEn ?? ""
      : business.disclaimerEn ?? "",
    headerWhatsappLabel: publicUi
      ? publicUi.headerWhatsappLabelEn ?? ""
      : undefined,
    footerWhatsappLabel: publicUi
      ? publicUi.footerWhatsappLabelEn ?? ""
      : undefined,
    footerWhatsappChannelLabel: publicUi
      ? publicUi.footerWhatsappChannelLabelEn ?? ""
      : undefined,
    floatingWhatsappMessage: publicUi
      ? publicUi.floatingWhatsappMessageEn ?? ""
      : resolveWhatsappDefaultMessage(business),
  };
}

export function buildGlobalSiteSettingsSnapshot(input: {
  business: BusinessSettings;
  publicUi: PublicUiSettings;
  forms: FormsSettings;
  branding: BrandingSettings;
}): GlobalSiteSettingsSnapshot {
  return {
    business: input.business,
    publicUi: input.publicUi,
    forms: input.forms,
    branding: input.branding,
  };
}
