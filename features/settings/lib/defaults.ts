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

export const DEFAULT_DISCLAIMER_UR =
  "PakExcise.com ایک نجی سہولت سروس ہے اور کسی بھی سرکاری محکمے سے وابستہ نہیں ہے۔";

export const DEFAULT_WHATSAPP_MESSAGE_EN =
  "Hi PakExcise, I need help with a service.";

export const DEFAULT_WHATSAPP_MESSAGE_UR =
  "السلام علیکم، مجھے PakExcise سروس کے بارے میں مدد چاہیے۔";

export const DEFAULT_PHONE_DISPLAY = "0345-0664441";
export const DEFAULT_WHATSAPP_LINK_NUMBER = "923450664441";
export const DEFAULT_SUPPORT_EMAIL = "info@pakexcise.com";
export const DEFAULT_WHATSAPP_CHANNEL_URL =
  "https://whatsapp.com/channel/0029VbCsDJXHLHQUel3u8C1O";

export const DEFAULT_FOOTER_DESCRIPTION_EN =
  "PakExcise helps customers submit and manage vehicle, license, token tax, and e-challan service requests through a private facilitation platform.";

export const DEFAULT_FOOTER_DESCRIPTION_UR =
  "PakExcise گاہکوں کو گاڑی، لائنس، ٹوکن ٹیکس اور ای چالان سروس درخواستیں جمع کرنے اور منظم کرنے میں ایک نجی سہولت پلیٹ فارم کے ذریعے مدد کرتا ہے۔";

export function defaultBusinessSettings(): BusinessSettings {
  const supportDaysEn = "Monday to Sunday";
  const supportDaysUr = "پیر تا اتوار";
  const supportHoursEn = "7:00 AM – 12:00 PM";
  const supportHoursUr = "صبح 7:00 – 12:00";

  return {
    siteName: siteConfig.name,
    businessEmail: DEFAULT_SUPPORT_EMAIL,
    phoneDisplayNumber: DEFAULT_PHONE_DISPLAY,
    whatsappLinkNumber: DEFAULT_WHATSAPP_LINK_NUMBER,
    whatsappDefaultMessageEn: DEFAULT_WHATSAPP_MESSAGE_EN,
    whatsappDefaultMessageUr: DEFAULT_WHATSAPP_MESSAGE_UR,
    supportDaysEn,
    supportDaysUr,
    supportHoursEn,
    supportHoursUr,
    whatsappChannelUrl: DEFAULT_WHATSAPP_CHANNEL_URL,
    businessHoursEn: `${supportDaysEn} · ${supportHoursEn}`,
    businessHoursUr: `${supportDaysUr} · ${supportHoursUr}`,
    addressEn: "Pakistan (Punjab & Islamabad ICT coverage)",
    addressUr: "پاکستان (پنجاب اور اسلام آباد ICT کوریج)",
    disclaimerEn: DEFAULT_DISCLAIMER_EN,
    disclaimerUr: DEFAULT_DISCLAIMER_UR,
    footerDescriptionEn: DEFAULT_FOOTER_DESCRIPTION_EN,
    footerDescriptionUr: DEFAULT_FOOTER_DESCRIPTION_UR,
  };
}

export function defaultPublicUiSettings(): PublicUiSettings {
  return {
    headerWhatsappEnabled: true,
    headerWhatsappLabelEn: "WhatsApp",
    headerWhatsappLabelUr: "واٹس ایپ",
    footerWhatsappLabelEn: "Chat on WhatsApp",
    footerWhatsappLabelUr: "واٹس ایپ پر چیٹ کریں",
    footerWhatsappChannelLabelEn: "Join WhatsApp Channel",
    footerWhatsappChannelLabelUr: "واٹس ایپ چینل جوائن کریں",
    announcementBarEnabled: true,
    announcementBarTextEn: DEFAULT_DISCLAIMER_EN,
    announcementBarTextUr: DEFAULT_DISCLAIMER_UR,
    defaultApplyCtaTextEn: "Apply now",
    defaultApplyCtaTextUr: "اب درخواست دیں",
    defaultSubmitRequestCtaTextEn: "Submit request",
    defaultSubmitRequestCtaTextUr: "درخواست جمع کروائیں",
    floatingWhatsappMessageEn: DEFAULT_WHATSAPP_MESSAGE_EN,
    floatingWhatsappMessageUr: DEFAULT_WHATSAPP_MESSAGE_UR,
    floatingWhatsappPosition: "bottom-right",
  };
}

export function defaultFormsSettings(): FormsSettings {
  return {
    contactRecipientEmail: DEFAULT_SUPPORT_EMAIL,
    contactSuccessMessageEn:
      "Thank you. Our support team will contact you shortly.",
    contactSuccessMessageUr:
      "شکریہ۔ ہماری سپورٹ ٹیم جلد آپ سے رابطہ کرے گی۔",
    contactAdminNotificationEnabled: true,
    contactAutoReplyEnabled: false,
    submitRequestSuccessMessageEn:
      "Your support request was submitted. We will contact you soon.",
    submitRequestSuccessMessageUr:
      "آپ کی سپورٹ درخواست جمع ہو گئی۔ ہم جلد رابطہ کریں گے۔",
    submitRequestSaveToSupportRequests: true,
    submitRequestNotifyAdminEnabled: true,
  };
}

export function defaultBrandingSettings(): BrandingSettings {
  return {
    logoPath: brandingAssets.logo,
    logoDarkPath: brandingAssets.logoDark,
    footerLogoPath: brandingAssets.logo,
    faviconPath: brandingAssets.favicon,
    defaultOgImagePath: brandingAssets.ogEn,
    defaultTwitterImagePath: brandingAssets.ogEn,
    defaultBlogFallbackImagePath: brandingAssets.ogEn,
    defaultGuideFallbackImagePath: brandingAssets.ogEn,
    defaultServiceFallbackImagePath: brandingAssets.ogEn,
    defaultRegionFallbackImagePath: brandingAssets.ogEn,
    primaryBrandColor: "#2159BA",
    secondaryBrandColor: "#FAC515",
  };
}

export function combineBusinessHours(
  supportDaysEn: string,
  supportHoursEn: string,
  supportDaysUr: string,
  supportHoursUr: string,
): { businessHoursEn: string; businessHoursUr: string } {
  return {
    businessHoursEn: `${supportDaysEn.trim()} · ${supportHoursEn.trim()}`,
    businessHoursUr: `${supportDaysUr.trim()} · ${supportHoursUr.trim()}`,
  };
}

export function defaultPaymentSettings(): PaymentSettings {
  return {
    jazzCashInstructionsEn:
      "Send payment to the JazzCash account shown on your invoice. Include your tracking ID in the reference.",
    jazzCashInstructionsUr:
      "اپنی انوائس پر دیے گئے JazzCash اکاؤنٹ پر ادائیگی بھیجیں۔ حوالہ میں اپنی ٹریکنگ ID لکھیں۔",
    easypaisaInstructionsEn:
      "Send payment to the Easypaisa account shown on your invoice. Include your tracking ID in the reference.",
    easypaisaInstructionsUr:
      "اپنی انوائس پر دیے گئے Easypaisa اکاؤنٹ پر ادائیگی بھیجیں۔ حوالہ میں اپنی ٹریکنگ ID لکھیں۔",
    bankTransferInstructionsEn:
      "Transfer to the bank account on your invoice. Email the receipt with your tracking ID.",
    bankTransferInstructionsUr:
      "انوائس پر دیے گئے بینک اکاؤنٹ میں ٹرانسفر کریں۔ رسید اپنی ٹریکنگ ID کے ساتھ بھیجیں۔",
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
    defaultMetaTitleUr: `${siteConfig.name} | نجی ایکسائز سہولت`,
    defaultMetaDescriptionEn: siteConfig.description,
    defaultMetaDescriptionUr:
      "پاکستان کے لیے نجی ایکسائز سہولت سروس۔ کسی بھی سرکاری ادارے سے وابستہ نہیں۔",
    defaultOgImage: brandingAssets.ogEn,
    defaultTwitterImage: brandingAssets.ogEn,
    canonicalDomain: siteConfig.url.replace(/\/$/, ""),
    sitemapEnabled: true,
    organizationName: siteConfig.name,
    organizationDescriptionEn: siteConfig.description,
    organizationDescriptionUr:
      "پاکستان کے لیے نجی ایکسائز سہولت سروس۔ کسی بھی سرکاری ادارے سے وابستہ نہیں۔",
    organizationLogoPath: brandingAssets.logo,
    organizationAreaServed: "Pakistan",
    localBusinessName: siteConfig.name,
    localBusinessDescriptionEn: siteConfig.description,
    localBusinessDescriptionUr:
      "پاکستان کے لیے نجی ایکسائز سہولت سروس۔ کسی بھی سرکاری ادارے سے وابستہ نہیں۔",
    localBusinessPriceRange: "",
    localBusinessAreaServed: "Pakistan",
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
    guidesEnabled: true,
    reviewsEnabled: true,
    contactFormEnabled: true,
    submitRequestEnabled: true,
    floatingWhatsappEnabled: true,
    whatsappChannelEnabled: true,
    whatsappNotificationsEnabled: true,
    smsFallbackEnabled: true,
    maintenanceMode: false,
    maintenanceMessageEn:
      "PakExcise.com is temporarily unavailable for maintenance. Please check back soon.",
    maintenanceMessageUr:
      "PakExcise.com عارضی دیکھ بھال کے لیے بند ہے۔ براہ کرم بعد میں دوبارہ کوشش کریں۔",
  };
}
