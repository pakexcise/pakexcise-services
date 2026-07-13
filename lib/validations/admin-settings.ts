import { z } from "zod";

const optionalTrackingId = z.string().trim().max(64).default("");

const businessSettingsSchema = z.object({
  siteName: z.string().trim().min(1).max(120),
  addressEn: z.string().trim().min(1).max(500),
});

const paymentMethodSchema = z.object({
  id: z.string().trim().min(1).max(64),
  nameEn: z.string().trim().min(1).max(120),
  accountTitle: z.string().trim().max(160),
  accountNumber: z.string().trim().max(80),
  iban: z.string().trim().max(80),
  instructionsEn: z.string().trim().max(2000),
  isActive: z.boolean(),
  displayOrder: z.number().int().min(0).max(9999),
});

const paymentSettingsSchema = z.object({
  jazzCashInstructionsEn: z.string().trim().min(1).max(2000),
  easypaisaInstructionsEn: z.string().trim().min(1).max(2000),
  bankTransferInstructionsEn: z.string().trim().min(1).max(2000),
  paymentAccountDisplayName: z.string().trim().min(1).max(120),
  manualPaymentEnabled: z.boolean(),
  jazzCashGatewayEnabled: z.boolean(),
  easypaisaGatewayEnabled: z.boolean(),
  cardGatewayEnabled: z.boolean(),
  gatewayPhase2Note: z.string().trim().max(500),
  paymentMethods: z.array(paymentMethodSchema).default([]),
});

const seoSettingsSchema = z.object({
  defaultMetaTitleEn: z.string().trim().min(1).max(120),
  defaultMetaDescriptionEn: z.string().trim().min(1).max(320),
  defaultOgImage: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .refine(
      (value) => value.startsWith("/") || value.startsWith("http"),
      "OG image must be a site path or URL",
    ),
  defaultTwitterImage: z
    .string()
    .trim()
    .max(500)
    .refine(
      (value) => value === "" || value.startsWith("/") || value.startsWith("http"),
      "Twitter image must be a site path or URL",
    ),
  canonicalDomain: z
    .string()
    .trim()
    .max(200)
    .refine(
      (value) =>
        value === "" || value.startsWith("http") || value.startsWith("https"),
      "Canonical domain must be a valid URL",
    ),
  sitemapEnabled: z.boolean(),
  organizationName: z.string().trim().min(1).max(120),
  organizationDescriptionEn: z.string().trim().min(1).max(500),
  organizationLogoPath: z.string().trim().min(1).max(500),
  organizationAreaServed: z.string().trim().min(1).max(120),
  localBusinessName: z.string().trim().min(1).max(120),
  localBusinessDescriptionEn: z.string().trim().min(1).max(500),
  localBusinessPriceRange: z.string().trim().max(20),
  localBusinessAreaServed: z.string().trim().min(1).max(120),
  localBusinessTelephone: z.string().trim().min(7).max(40),
  localBusinessStreetAddress: z.string().trim().min(3).max(200),
  localBusinessAddressLocality: z.string().trim().min(2).max(120),
  localBusinessPostalCode: z.string().trim().min(3).max(20),
  localBusinessAddressCountry: z.string().trim().min(2).max(8),
});

const trackingSettingsSchema = z.object({
  ga4MeasurementId: optionalTrackingId,
  gtmId: optionalTrackingId,
  metaPixelId: optionalTrackingId,
  tiktokPixelId: optionalTrackingId,
  consentMode: z.enum(["implied", "explicit", "disabled"]),
  requireConsentBeforeScripts: z.boolean(),
  showConsentBanner: z.boolean(),
});

const featureFlagSettingsSchema = z
  .object({
  agentModuleEnabled: z.boolean(),
  blogEnabled: z.boolean(),
  reviewsEnabled: z.boolean(),
  contactFormEnabled: z.boolean(),
  submitRequestEnabled: z.boolean(),
  floatingWhatsappEnabled: z.boolean(),
  whatsappChannelEnabled: z.boolean(),
  whatsappNotificationsEnabled: z.boolean(),
  smsFallbackEnabled: z.boolean(),
  maintenanceMode: z.boolean(),
  maintenanceMessageEn: z.string().trim().min(5).max(500),
})
  .strip();

export const updateBusinessSettingsSchema = businessSettingsSchema;
export const updatePaymentSettingsSchema = paymentSettingsSchema;
export const updateSeoSettingsSchema = seoSettingsSchema;
export const updateTrackingSettingsSchema = trackingSettingsSchema;
export const updateFeatureFlagSettingsSchema = featureFlagSettingsSchema;

export const settingsGroupSchema = z.enum([
  "business",
  "payment",
  "seo",
  "tracking",
  "features",
]);

export type SettingsGroup = z.infer<typeof settingsGroupSchema>;
