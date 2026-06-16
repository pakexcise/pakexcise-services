import type { ContactPageSettings } from "@/features/contact-page/types";
import type {
  BrandingSettings,
  BusinessSettings,
  FormsSettings,
  GlobalSiteSettingsSnapshot,
  PublicUiSettings,
} from "@/features/settings/types";
import { pickLocalized } from "@/lib/i18n/content";
import type { Locale } from "@/i18n/config";
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
    supportDaysUr: business.supportDaysUr,
    supportHoursEn: business.supportHoursEn,
    supportHoursUr: business.supportHoursUr,
    whatsappChannelUrl: resolveWhatsappChannelUrl(business),
    whatsappPrefillMessage: business.whatsappDefaultMessageEn,
  };
}

export function localizeGlobalSiteContent(
  business: BusinessSettings,
  locale: Locale,
  publicUi?: PublicUiSettings,
) {
  return {
    footerDescription: pickLocalized(locale, {
      en: business.footerDescriptionEn,
      ur: business.footerDescriptionUr,
    }),
    disclaimer: pickLocalized(locale, {
      en: business.disclaimerEn,
      ur: business.disclaimerUr,
    }),
    supportDays: pickLocalized(locale, {
      en: business.supportDaysEn,
      ur: business.supportDaysUr,
    }),
    supportHours: pickLocalized(locale, {
      en: business.supportHoursEn,
      ur: business.supportHoursUr,
    }),
    businessHours: pickLocalized(locale, {
      en: business.businessHoursEn,
      ur: business.businessHoursUr,
    }),
    whatsappMessage: resolveWhatsappDefaultMessage(business, locale),
    announcementText: publicUi
      ? pickLocalized(locale, {
          en: publicUi.announcementBarTextEn,
          ur: publicUi.announcementBarTextUr,
        })
      : pickLocalized(locale, {
          en: business.disclaimerEn,
          ur: business.disclaimerUr,
        }),
    headerWhatsappLabel: publicUi
      ? pickLocalized(locale, {
          en: publicUi.headerWhatsappLabelEn,
          ur: publicUi.headerWhatsappLabelUr,
        })
      : undefined,
    floatingWhatsappMessage: publicUi
      ? pickLocalized(locale, {
          en: publicUi.floatingWhatsappMessageEn,
          ur: publicUi.floatingWhatsappMessageUr,
        })
      : resolveWhatsappDefaultMessage(business, locale),
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
