export type BusinessSettings = {
  siteName: string;
  businessEmail: string;
  phoneNumber: string;
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  businessHoursEn: string;
  businessHoursUr: string;
  addressEn: string;
  addressUr: string;
  disclaimerEn: string;
  disclaimerUr: string;
};

export type PaymentSettings = {
  jazzCashInstructionsEn: string;
  jazzCashInstructionsUr: string;
  easypaisaInstructionsEn: string;
  easypaisaInstructionsUr: string;
  bankTransferInstructionsEn: string;
  bankTransferInstructionsUr: string;
  paymentAccountDisplayName: string;
  manualPaymentEnabled: boolean;
  jazzCashGatewayEnabled: boolean;
  easypaisaGatewayEnabled: boolean;
  cardGatewayEnabled: boolean;
  gatewayPhase2Note: string;
};

export type SeoSettings = {
  defaultMetaTitleEn: string;
  defaultMetaTitleUr: string;
  defaultMetaDescriptionEn: string;
  defaultMetaDescriptionUr: string;
  defaultOgImage: string;
  organizationName: string;
  organizationDescriptionEn: string;
  organizationDescriptionUr: string;
  organizationLogoPath: string;
  organizationAreaServed: string;
  localBusinessName: string;
  localBusinessDescriptionEn: string;
  localBusinessDescriptionUr: string;
  localBusinessPriceRange: string;
  localBusinessAreaServed: string;
};

export type ConsentMode = "implied" | "explicit" | "disabled";

export type TrackingSettings = {
  ga4MeasurementId: string;
  gtmId: string;
  metaPixelId: string;
  tiktokPixelId: string;
  consentMode: ConsentMode;
  requireConsentBeforeScripts: boolean;
  showConsentBanner: boolean;
};

export type FeatureFlagSettings = {
  agentModuleEnabled: boolean;
  blogEnabled: boolean;
  guidesEnabled: boolean;
  whatsappNotificationsEnabled: boolean;
  smsFallbackEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessageEn: string;
  maintenanceMessageUr: string;
};

export type PublicSettingsSnapshot = {
  business: BusinessSettings;
  payment: PaymentSettings;
  seo: SeoSettings;
  tracking: TrackingSettings;
  features: FeatureFlagSettings;
};

export type AdminSettingsSnapshot = PublicSettingsSnapshot;
