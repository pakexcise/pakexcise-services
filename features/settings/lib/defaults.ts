import { siteConfig } from "@/config/site";

import type {
  BusinessSettings,
  FeatureFlagSettings,
  PaymentSettings,
  SeoSettings,
  TrackingSettings,
} from "@/features/settings/types";

export const DEFAULT_DISCLAIMER_EN =
  "PakExcise.com is a private facilitation service and is not affiliated with any government department.";

export const DEFAULT_DISCLAIMER_UR =
  "PakExcise.com ایک نجی سہولت سروس ہے اور کسی بھی سرکاری محکمے سے وابستہ نہیں ہے۔";

export function defaultBusinessSettings(): BusinessSettings {
  return {
    siteName: siteConfig.name,
    businessEmail: siteConfig.contact.email,
    phoneNumber: siteConfig.contact.phone,
    whatsappNumber: siteConfig.contact.whatsapp,
    whatsappDefaultMessage: siteConfig.contact.whatsappMessage,
    businessHoursEn: "Mon–Sat, 10:00 AM – 6:00 PM PKT",
    businessHoursUr: "پیر تا ہفتہ، صبح 10:00 تا شام 6:00 بجے PKT",
    addressEn: "Pakistan (Punjab & Islamabad ICT coverage)",
    addressUr: "پاکستان (پنجاب اور اسلام آباد ICT کوریج)",
    disclaimerEn: DEFAULT_DISCLAIMER_EN,
    disclaimerUr: DEFAULT_DISCLAIMER_UR,
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
  };
}

export function defaultSeoSettings(): SeoSettings {
  return {
    defaultMetaTitleEn: `${siteConfig.name} | Private Excise Facilitation`,
    defaultMetaTitleUr: `${siteConfig.name} | نجی ایکسائز سہولت`,
    defaultMetaDescriptionEn: siteConfig.description,
    defaultMetaDescriptionUr:
      "پاکستان کے لیے نجی ایکسائز سہولت سروس۔ کسی بھی سرکاری ادارے سے وابستہ نہیں۔",
    defaultOgImage: "/og-default.png",
    organizationName: siteConfig.name,
    organizationDescriptionEn: siteConfig.description,
    organizationDescriptionUr:
      "پاکستان کے لیے نجی ایکسائز سہولت سروس۔ کسی بھی سرکاری ادارے سے وابستہ نہیں۔",
    organizationLogoPath: "/logo.png",
    organizationAreaServed: "Pakistan",
    localBusinessName: siteConfig.name,
    localBusinessDescriptionEn: siteConfig.description,
    localBusinessDescriptionUr:
      "پاکستان کے لیے نجی ایکسائز سہولت سروس۔ کسی بھی سرکاری ادارے سے وابستہ نہیں۔",
    localBusinessPriceRange: "$$",
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
    whatsappNotificationsEnabled: true,
    smsFallbackEnabled: true,
    maintenanceMode: false,
    maintenanceMessageEn:
      "PakExcise.com is temporarily unavailable for maintenance. Please check back soon.",
    maintenanceMessageUr:
      "PakExcise.com عارضی دیکھ بھال کے لیے بند ہے۔ براہ کرم بعد میں دوبارہ کوشش کریں۔",
  };
}
