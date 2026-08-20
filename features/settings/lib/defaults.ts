import { brandingAssets } from "@/config/branding";
import { siteConfig } from "@/config/site";

import type {
  BrandingSettings,
  BusinessSettings,
  FeatureFlagSettings,
  FormsSettings,
  PaymentSettings,
  PublicUiSettings,
  SeoSettings,
  TrackingSettings,
} from "@/features/settings/types";

export const DEFAULT_DISCLAIMER_EN =
  "PakExcise.com is a private facilitation service and is not affiliated with any government department.";

export const DEFAULT_WHATSAPP_MESSAGE_EN =
  "Hi PakExcise, I need help with a service.";

export const DEFAULT_PHONE_DISPLAY = "0345-0664441";
export const DEFAULT_WHATSAPP_LINK_NUMBER = "923450664441";
export const DEFAULT_SUPPORT_EMAIL = "info@pakexcise.com";
export const DEFAULT_WHATSAPP_CHANNEL_URL =
  "https://whatsapp.com/channel/0029VbCsDJXHLHQUel3u8C1O";

export const DEFAULT_FOOTER_DESCRIPTION_EN =
  "PakExcise helps customers submit and manage vehicle, license, token tax, and e-challan service requests through a private facilitation platform.";

export function defaultBusinessSettings(): BusinessSettings {
  const supportDaysEn = "Monday to Sunday";
  const supportHoursEn = "7:00 AM – 11:30 PM";

  return {
    siteName: siteConfig.name,
    businessEmail: DEFAULT_SUPPORT_EMAIL,
    phoneDisplayNumber: DEFAULT_PHONE_DISPLAY,
    whatsappLinkNumber: DEFAULT_WHATSAPP_LINK_NUMBER,
    whatsappDefaultMessageEn: DEFAULT_WHATSAPP_MESSAGE_EN,
    supportDaysEn,
    supportHoursEn,
    whatsappChannelUrl: DEFAULT_WHATSAPP_CHANNEL_URL,
    businessHoursEn: `${supportDaysEn} · ${supportHoursEn}`,
    addressEn: "Service Rd E, Near H 9/4 H-9, Islamabad, 44000",
    disclaimerEn: DEFAULT_DISCLAIMER_EN,
    footerDescriptionEn: DEFAULT_FOOTER_DESCRIPTION_EN,
  };
}

export function defaultPublicUiSettings(): PublicUiSettings {
  return {
    headerWhatsappEnabled: true,
    headerWhatsappLabelEn: "WhatsApp",
    footerWhatsappLabelEn: "Chat on WhatsApp",
    footerWhatsappChannelLabelEn: "Join WhatsApp Channel",
    announcementBarEnabled: true,
    announcementBarTextEn: "",
    defaultApplyCtaTextEn: "Apply now",
    defaultSubmitRequestCtaTextEn: "Submit request",
    floatingWhatsappMessageEn: DEFAULT_WHATSAPP_MESSAGE_EN,
    floatingWhatsappPosition: "bottom-right",
  };
}

export function defaultFormsSettings(): FormsSettings {
  return {
    contactRecipientEmail: DEFAULT_SUPPORT_EMAIL,
    contactSuccessMessageEn:
      "Thank you. Our support team will contact you shortly.",
    contactAdminNotificationEnabled: true,
    contactAutoReplyEnabled: true,
    submitRequestSuccessMessageEn:
      "Your support request was submitted. We will contact you soon.",
    submitRequestSaveToSupportRequests: true,
    submitRequestNotifyAdminEnabled: true,
    submitRequestAutoReplyEnabled: true,
  };
}

export function defaultBrandingSettings(): BrandingSettings {
  return {
    logoPath: brandingAssets.logo,
    logoDarkPath: brandingAssets.logoDark,
    footerLogoPath: brandingAssets.logo,
    logoIconPath: brandingAssets.logoIcon,
    faviconPath: brandingAssets.favicon,
    appleIconPath: brandingAssets.appleIcon,
    defaultOgImagePath: brandingAssets.ogEn,
    defaultTwitterImagePath: brandingAssets.ogEn,
    defaultBlogFallbackImagePath: brandingAssets.ogEn,
    defaultServiceFallbackImagePath: brandingAssets.ogEn,
    defaultRegionFallbackImagePath: brandingAssets.ogEn,
    primaryBrandColor: "#2159BA",
    secondaryBrandColor: "#FAC515",
  };
}

export function combineBusinessHours(
  supportDaysEn: string,
  supportHoursEn: string,
): { businessHoursEn: string } {
  return {
    businessHoursEn: `${supportDaysEn.trim()} · ${supportHoursEn.trim()}`,
  };
}

export function defaultPaymentSettings(): PaymentSettings {
  return {
    jazzCashInstructionsEn:
      "Send payment to the JazzCash account shown on your invoice. Include your tracking ID in the reference.",
    easypaisaInstructionsEn:
      "Send payment to the Easypaisa account shown on your invoice. Include your tracking ID in the reference.",
    bankTransferInstructionsEn:
      "Transfer to the bank account on your invoice. Email the receipt with your tracking ID.",
    paymentAccountDisplayName: "PakExcise Facilitation",
    manualPaymentEnabled: true,
    jazzCashGatewayEnabled: false,
    easypaisaGatewayEnabled: false,
    cardGatewayEnabled: false,
    gatewayPhase2Note:
      "Online payment gateways (JazzCash, Easypaisa, cards) are planned for Phase 2.",
    paymentMethods: [],
  };
}

export function defaultSeoSettings(): SeoSettings {
  return {
    defaultMetaTitleEn: `${siteConfig.name} | Private Excise Facilitation`,
    defaultMetaDescriptionEn: siteConfig.description,
    defaultOgImage: brandingAssets.ogEn,
    defaultTwitterImage: brandingAssets.ogEn,
    canonicalDomain: siteConfig.url.replace(/\/$/, ""),
    sitemapEnabled: true,
    organizationName: siteConfig.name,
    organizationDescriptionEn: siteConfig.description,
    organizationLogoPath: brandingAssets.logo,
    organizationAreaServed: "Pakistan",
    localBusinessName: siteConfig.name,
    localBusinessDescriptionEn: siteConfig.description,
    localBusinessPriceRange: "",
    localBusinessAreaServed: "Pakistan",
    localBusinessTelephone: DEFAULT_PHONE_DISPLAY,
    localBusinessStreetAddress: "Service Rd E, Near H 9/4 H-9",
    localBusinessAddressLocality: "Islamabad",
    localBusinessPostalCode: "44000",
    localBusinessAddressCountry: "PK",
  };
}

export function defaultTrackingSettings(): TrackingSettings {
  return {
    ga4MeasurementId: "",
    gtmId: "",
    metaPixelId: "",
    tiktokPixelId: "",
    consentMode: "implied",
    requireConsentBeforeScripts: false,
    showConsentBanner: false,
  };
}

export function defaultFeatureFlagSettings(): FeatureFlagSettings {
  return {
    agentModuleEnabled: true,
    blogEnabled: true,
    reviewsEnabled: true,
    contactFormEnabled: true,
    submitRequestEnabled: true,
    floatingWhatsappEnabled: true,
    whatsappChannelEnabled: true,
    whatsappNotificationsEnabled: true,
    smsFallbackEnabled: true,
    emailNotificationsEnabled: true,
    applicationSubmissionEmailsEnabled: true,
    applicationStatusEmailsEnabled: false,
    invoicePaymentEmailsEnabled: false,
    reviewDecisionEmailsEnabled: false,
    maintenanceMode: false,
    maintenanceMessageEn:
      "PakExcise.com is temporarily unavailable for maintenance. Please check back soon.",
  };
}
