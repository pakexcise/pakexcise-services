import { z } from "zod";

const localizedText = z.string().trim().min(1).max(2000);
const shortText = z.string().trim().min(1).max(500);
const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => value === "" || value.startsWith("http"), {
    message: "Must be a valid URL",
  });

const businessContactSchema = z.object({
  businessEmail: z.string().trim().email().max(160),
  phoneDisplayNumber: z.string().trim().min(5).max(40),
  whatsappLinkNumber: z.string().trim().min(8).max(20),
  whatsappDefaultMessageEn: z.string().trim().min(5).max(500),
  supportDaysEn: z.string().trim().min(1).max(120),
  supportHoursEn: z.string().trim().min(1).max(120),
  whatsappChannelUrl: optionalUrl,
});

const footerSchema = z.object({
  footerDescriptionEn: localizedText,
  disclaimerEn: z.string().trim().min(10).max(1000),
});

export const publicUiSettingsSchema = z.object({
  headerWhatsappEnabled: z.boolean(),
  headerWhatsappLabelEn: shortText,
  footerWhatsappLabelEn: shortText,
  footerWhatsappChannelLabelEn: shortText,
  announcementBarEnabled: z.boolean(),
  announcementBarTextEn: z.string().trim().min(10).max(1000),
  defaultApplyCtaTextEn: shortText,
  defaultSubmitRequestCtaTextEn: shortText,
  floatingWhatsappMessageEn: z.string().trim().min(5).max(500),
  floatingWhatsappPosition: z.enum(["bottom-right", "bottom-left"]),
});

export const formsSettingsSchema = z.object({
  contactRecipientEmail: z.string().trim().email().max(160),
  contactSuccessMessageEn: localizedText,
  contactAdminNotificationEnabled: z.boolean(),
  contactAutoReplyEnabled: z.boolean(),
  submitRequestSuccessMessageEn: localizedText,
  submitRequestSaveToSupportRequests: z.boolean(),
  submitRequestNotifyAdminEnabled: z.boolean(),
});

const assetPathSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine(
    (value) => value.startsWith("/") || value.startsWith("http"),
    "Asset path must be a site path or URL",
  );

const colorSchema = z
  .string()
  .trim()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, "Must be a hex color");

export const brandingSettingsSchema = z.object({
  logoPath: assetPathSchema,
  logoDarkPath: assetPathSchema,
  footerLogoPath: assetPathSchema,
  logoIconPath: assetPathSchema,
  faviconPath: assetPathSchema,
  appleIconPath: assetPathSchema,
  defaultOgImagePath: assetPathSchema,
  defaultTwitterImagePath: assetPathSchema,
  defaultBlogFallbackImagePath: assetPathSchema,
  defaultGuideFallbackImagePath: assetPathSchema,
  defaultServiceFallbackImagePath: assetPathSchema,
  defaultRegionFallbackImagePath: assetPathSchema,
  primaryBrandColor: colorSchema,
  secondaryBrandColor: colorSchema,
});

export const updateGlobalSiteSettingsSchema = z.object({
  business: businessContactSchema.merge(footerSchema),
  publicUi: publicUiSettingsSchema,
  forms: formsSettingsSchema,
  branding: brandingSettingsSchema,
});
