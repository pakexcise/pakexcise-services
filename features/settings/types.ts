export type BusinessSettings = {
  siteName: string;
  businessEmail: string;
  /** @deprecated Use phoneDisplayNumber */
  phoneNumber?: string;
  /** @deprecated Use whatsappLinkNumber */
  whatsappNumber?: string;
  /** @deprecated Use whatsappDefaultMessageEn */
  whatsappDefaultMessage?: string;
  phoneDisplayNumber: string;
  whatsappLinkNumber: string;
  whatsappDefaultMessageEn: string;
  supportDaysEn: string;
  supportHoursEn: string;
  whatsappChannelUrl: string;
  businessHoursEn: string;
  addressEn: string;
  disclaimerEn: string;
  footerDescriptionEn: string;
};

export type PublicUiSettings = {
  headerWhatsappEnabled: boolean;
  headerWhatsappLabelEn: string;
  footerWhatsappLabelEn: string;
  footerWhatsappChannelLabelEn: string;
  announcementBarEnabled: boolean;
  announcementBarTextEn: string;
  defaultApplyCtaTextEn: string;
  defaultSubmitRequestCtaTextEn: string;
  floatingWhatsappMessageEn: string;
  floatingWhatsappPosition: "bottom-right" | "bottom-left";
};

export type FormsSettings = {
  contactRecipientEmail: string;
  contactSuccessMessageEn: string;
  contactAdminNotificationEnabled: boolean;
  contactAutoReplyEnabled: boolean;
  submitRequestSuccessMessageEn: string;
  submitRequestSaveToSupportRequests: boolean;
  submitRequestNotifyAdminEnabled: boolean;
};

export type BrandingSettings = {
  logoPath: string;
  logoDarkPath: string;
  footerLogoPath: string;
  logoIconPath: string;
  faviconPath: string;
  appleIconPath: string;
  defaultOgImagePath: string;
  defaultTwitterImagePath: string;
  defaultBlogFallbackImagePath: string;
  defaultServiceFallbackImagePath: string;
  defaultRegionFallbackImagePath: string;
  primaryBrandColor: string;
  secondaryBrandColor: string;
};

export type StructuredPaymentMethodSettings = {
  id: string;
  nameEn: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  instructionsEn: string;
  isActive: boolean;
  displayOrder: number;
};

export type GlobalSiteSettingsSnapshot = {
  business: BusinessSettings;
  publicUi: PublicUiSettings;
  forms: FormsSettings;
  branding: BrandingSettings;
};

export type PaymentSettings = {
  jazzCashInstructionsEn: string;
  easypaisaInstructionsEn: string;
  bankTransferInstructionsEn: string;
  paymentAccountDisplayName: string;
  manualPaymentEnabled: boolean;
  jazzCashGatewayEnabled: boolean;
  easypaisaGatewayEnabled: boolean;
  cardGatewayEnabled: boolean;
  gatewayPhase2Note: string;
  paymentMethods: StructuredPaymentMethodSettings[];
};

export type SeoSettings = {
  defaultMetaTitleEn: string;
  defaultMetaDescriptionEn: string;
  defaultOgImage: string;
  defaultTwitterImage: string;
  canonicalDomain: string;
  sitemapEnabled: boolean;
  organizationName: string;
  organizationDescriptionEn: string;
  organizationLogoPath: string;
  organizationAreaServed: string;
  localBusinessName: string;
  localBusinessDescriptionEn: string;
  localBusinessPriceRange: string;
  localBusinessAreaServed: string;
  localBusinessTelephone: string;
  localBusinessStreetAddress: string;
  localBusinessAddressLocality: string;
  localBusinessPostalCode: string;
  localBusinessAddressCountry: string;
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
  reviewsEnabled: boolean;
  contactFormEnabled: boolean;
  submitRequestEnabled: boolean;
  floatingWhatsappEnabled: boolean;
  whatsappChannelEnabled: boolean;
  whatsappNotificationsEnabled: boolean;
  smsFallbackEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessageEn: string;
};

export type PublicSettingsSnapshot = {
  business: BusinessSettings;
  publicUi: PublicUiSettings;
  forms: FormsSettings;
  branding: BrandingSettings;
  payment: PaymentSettings;
  seo: SeoSettings;
  tracking: TrackingSettings;
  features: FeatureFlagSettings;
};

export type AdminSettingsSnapshot = PublicSettingsSnapshot;
