import { z } from "zod";

const optionalTrackingId = z.string().trim().max(64).default("");

const businessSettingsSchema = z.object({
  siteName: z.string().trim().min(1).max(120),
  businessEmail: z.string().trim().email().max(160),
  phoneNumber: z.string().trim().min(5).max(40),
  whatsappNumber: z
    .string()
    .trim()
    .min(8)
    .max(20)
    .regex(/^\d+$/, "WhatsApp number must contain digits only"),
  whatsappDefaultMessage: z.string().trim().min(5).max(500),
  businessHoursEn: z.string().trim().min(1).max(200),
  businessHoursUr: z.string().trim().min(1).max(200),
  addressEn: z.string().trim().min(1).max(500),
  addressUr: z.string().trim().min(1).max(500),
  disclaimerEn: z.string().trim().min(10).max(1000),
  disclaimerUr: z.string().trim().min(10).max(1000),
});

const paymentSettingsSchema = z.object({
  jazzCashInstructionsEn: z.string().trim().min(1).max(2000),
  jazzCashInstructionsUr: z.string().trim().min(1).max(2000),
  easypaisaInstructionsEn: z.string().trim().min(1).max(2000),
  easypaisaInstructionsUr: z.string().trim().min(1).max(2000),
  bankTransferInstructionsEn: z.string().trim().min(1).max(2000),
  bankTransferInstructionsUr: z.string().trim().min(1).max(2000),
  paymentAccountDisplayName: z.string().trim().min(1).max(120),
  manualPaymentEnabled: z.boolean(),
  jazzCashGatewayEnabled: z.boolean(),
  easypaisaGatewayEnabled: z.boolean(),
  cardGatewayEnabled: z.boolean(),
  gatewayPhase2Note: z.string().trim().max(500),
});

const seoSettingsSchema = z.object({
  defaultMetaTitleEn: z.string().trim().min(1).max(120),
  defaultMetaTitleUr: z.string().trim().min(1).max(120),
  defaultMetaDescriptionEn: z.string().trim().min(1).max(320),
  defaultMetaDescriptionUr: z.string().trim().min(1).max(320),
  defaultOgImage: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .refine(
      (value) => value.startsWith("/") || value.startsWith("http"),
      "OG image must be a site path or URL",
    ),
  organizationName: z.string().trim().min(1).max(120),
  organizationDescriptionEn: z.string().trim().min(1).max(500),
  organizationDescriptionUr: z.string().trim().min(1).max(500),
  organizationLogoPath: z.string().trim().min(1).max(500),
  organizationAreaServed: z.string().trim().min(1).max(120),
  localBusinessName: z.string().trim().min(1).max(120),
  localBusinessDescriptionEn: z.string().trim().min(1).max(500),
  localBusinessDescriptionUr: z.string().trim().min(1).max(500),
  localBusinessPriceRange: z.string().trim().min(1).max(20),
  localBusinessAreaServed: z.string().trim().min(1).max(120),
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

const featureFlagSettingsSchema = z.object({
  agentModuleEnabled: z.boolean(),
  blogEnabled: z.boolean(),
  guidesEnabled: z.boolean(),
  whatsappNotificationsEnabled: z.boolean(),
  smsFallbackEnabled: z.boolean(),
  maintenanceMode: z.boolean(),
  maintenanceMessageEn: z.string().trim().min(5).max(500),
  maintenanceMessageUr: z.string().trim().min(5).max(500),
});

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
