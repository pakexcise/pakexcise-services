export type BusinessSettings = {
  siteName: string;
  businessEmail: string;
  /** @deprecated Use phoneDisplayNumber */
  phoneNumber?: string;
  /** @deprecated Use whatsappLinkNumber */
  whatsappNumber?: string;
  /** @deprecated Use whatsappDefaultMessageEn/Ur */
  whatsappDefaultMessage?: string;
  phoneDisplayNumber: string;
  whatsappLinkNumber: string;
  whatsappDefaultMessageEn: string;
  whatsappDefaultMessageUr: string;
  supportDaysEn: string;
  supportDaysUr: string;
  supportHoursEn: string;
  supportHoursUr: string;
  whatsappChannelUrl: string;
  businessHoursEn: string;
  businessHoursUr: string;
  addressEn: string;
  addressUr: string;
  disclaimerEn: string;
  disclaimerUr: string;
  footerDescriptionEn: string;
  footerDescriptionUr: string;
};

export type PublicUiSettings = {
  headerWhatsappEnabled: boolean;
  headerWhatsappLabelEn: string;
  headerWhatsappLabelUr: string;
  footerWhatsappLabelEn: string;
  footerWhatsappLabelUr: string;
  footerWhatsappChannelLabelEn: string;
  footerWhatsappChannelLabelUr: string;
  announcementBarEnabled: boolean;
  announcementBarTextEn: string;
  announcementBarTextUr: string;
  defaultApplyCtaTextEn: string;
  defaultApplyCtaTextUr: string;
  defaultSubmitRequestCtaTextEn: string;
  defaultSubmitRequestCtaTextUr: string;
  floatingWhatsappMessageEn: string;
  floatingWhatsappMessageUr: string;
  floatingWhatsappPosition: "bottom-right" | "bottom-left";
};

export type FormsSettings = {
  contactRecipientEmail: string;
  contactSuccessMessageEn: string;
  contactSuccessMessageUr: string;
  contactAdminNotificationEnabled: boolean;
  contactAutoReplyEnabled: boolean;
  submitRequestSuccessMessageEn: string;
  submitRequestSuccessMessageUr: string;
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
  defaultOgImagePathUr: string;
  defaultTwitterImagePath: string;
  defaultBlogFallbackImagePath: string;
  defaultGuideFallbackImagePath: string;
  defaultServiceFallbackImagePath: string;
  defaultRegionFallbackImagePath: string;
  primaryBrandColor: string;
  secondaryBrandColor: string;
};

export type StructuredPaymentMethodSettings = {
  id: string;
  nameEn: string;
  nameUr: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  instructionsEn: string;
  instructionsUr: string;
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
  paymentMethods: StructuredPaymentMethodSettings[];
};

export type SeoSettings = {
  defaultMetaTitleEn: string;
  defaultMetaTitleUr: string;
  defaultMetaDescriptionEn: string;
  defaultMetaDescriptionUr: string;
  defaultOgImage: string;
  defaultTwitterImage: string;
  canonicalDomain: string;
  sitemapEnabled: boolean;
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
  guidesEnabled: boolean;
  reviewsEnabled: boolean;
  contactFormEnabled: boolean;
  submitRequestEnabled: boolean;
  floatingWhatsappEnabled: boolean;
  whatsappChannelEnabled: boolean;
  whatsappNotificationsEnabled: boolean;
  smsFallbackEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessageEn: string;
  maintenanceMessageUr: string;
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
