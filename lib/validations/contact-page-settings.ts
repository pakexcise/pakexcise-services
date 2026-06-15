import { z } from "zod";

const localizedTextSchema = z.string().trim().min(1).max(500);
const optionalLocalizedTextSchema = z.string().trim().max(2000);

const contactMethodCardSchema = z.object({
  titleEn: localizedTextSchema,
  titleUr: localizedTextSchema,
  descriptionEn: optionalLocalizedTextSchema,
  descriptionUr: optionalLocalizedTextSchema,
  buttonLabelEn: localizedTextSchema.max(80),
  buttonLabelUr: localizedTextSchema.max(80),
  isActive: z.boolean(),
});

const serviceInterestOptionSchema = z.object({
  value: z.string().trim().min(1).max(80),
  labelEn: localizedTextSchema.max(120),
  labelUr: localizedTextSchema.max(120),
});

export const updateContactPageSettingsSchema = z.object({
  isPageActive: z.boolean(),
  heroTitleEn: localizedTextSchema.max(160),
  heroTitleUr: localizedTextSchema.max(160),
  heroDescriptionEn: optionalLocalizedTextSchema,
  heroDescriptionUr: optionalLocalizedTextSchema,
  phoneNumber: z.string().trim().min(7).max(30),
  whatsappNumber: z.string().trim().min(7).max(30),
  supportEmail: z.string().trim().email().max(160),
  supportDaysEn: localizedTextSchema.max(120),
  supportDaysUr: localizedTextSchema.max(120),
  supportHoursEn: localizedTextSchema.max(120),
  supportHoursUr: localizedTextSchema.max(120),
  whatsappChannelUrl: z.string().trim().url().max(500),
  whatsappPrefillMessage: z.string().trim().min(1).max(500),
  whatsappCard: contactMethodCardSchema,
  callCard: contactMethodCardSchema,
  emailCard: contactMethodCardSchema,
  whatsappChannelCard: contactMethodCardSchema,
  supportHoursCard: z.object({
    titleEn: localizedTextSchema.max(120),
    titleUr: localizedTextSchema.max(120),
    isActive: z.boolean(),
  }),
  formHeadingEn: localizedTextSchema.max(160),
  formHeadingUr: localizedTextSchema.max(160),
  formDescriptionEn: optionalLocalizedTextSchema,
  formDescriptionUr: optionalLocalizedTextSchema,
  socialHeadingEn: localizedTextSchema.max(160),
  socialHeadingUr: localizedTextSchema.max(160),
  socialDescriptionEn: optionalLocalizedTextSchema,
  socialDescriptionUr: optionalLocalizedTextSchema,
  ctaTitleEn: localizedTextSchema.max(160),
  ctaTitleUr: localizedTextSchema.max(160),
  ctaDescriptionEn: optionalLocalizedTextSchema,
  ctaDescriptionUr: optionalLocalizedTextSchema,
  ctaViewServicesLabelEn: localizedTextSchema.max(80),
  ctaViewServicesLabelUr: localizedTextSchema.max(80),
  ctaWhatsappLabelEn: localizedTextSchema.max(80),
  ctaWhatsappLabelUr: localizedTextSchema.max(80),
  ctaIsActive: z.boolean(),
  serviceInterestOptions: z.array(serviceInterestOptionSchema).min(1).max(30),
  seo: z.object({
    metaTitleEn: localizedTextSchema.max(160),
    metaTitleUr: localizedTextSchema.max(160),
    metaDescriptionEn: optionalLocalizedTextSchema,
    metaDescriptionUr: optionalLocalizedTextSchema,
  }),
});

export type UpdateContactPageSettingsInput = z.infer<
  typeof updateContactPageSettingsSchema
>;
