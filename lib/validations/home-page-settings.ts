import { z } from "zod";

const localizedPairSchema = z.object({
  en: z.string().trim().min(1),
  ur: z.string().trim().min(1),
});

const contentBlockSchema = z.object({
  titleEn: z.string().trim().min(1).max(300),
  titleUr: z.string().trim().min(1).max(300),
  descriptionEn: z.string().trim().min(1).max(5000),
  descriptionUr: z.string().trim().min(1).max(5000),
});

const sectionConfigSchema = z.object({
  isActive: z.boolean(),
  displayOrder: z.coerce.number().int().min(0).max(9999),
  titleEn: z.string().trim().min(1).max(300),
  titleUr: z.string().trim().min(1).max(300),
  descriptionEn: z.string().trim().min(1).max(5000),
  descriptionUr: z.string().trim().min(1).max(5000),
});

const homeSectionKeys = [
  "options",
  "popular",
  "services",
  "regions",
  "howItWorks",
  "vehicleVisual",
  "documents",
  "whyChoose",
  "about",
  "guides",
  "blog",
  "faqs",
  "finalCta",
] as const;

const sectionsSchema = z.object(
  Object.fromEntries(
    homeSectionKeys.map((key) => [key, sectionConfigSchema]),
  ) as Record<(typeof homeSectionKeys)[number], typeof sectionConfigSchema>,
);

export const updateHomePageSettingsSchema = z.object({
  isPageActive: z.boolean(),
  hero: z.object({
    badgeEn: z.string().trim().min(1).max(200),
    badgeUr: z.string().trim().min(1).max(200),
    titleEn: z.string().trim().min(1).max(300),
    titleUr: z.string().trim().min(1).max(300),
    descriptionEn: z.string().trim().min(1).max(5000),
    descriptionUr: z.string().trim().min(1).max(5000),
    browseCtaEn: z.string().trim().min(1).max(100),
    browseCtaUr: z.string().trim().min(1).max(100),
    whatsappCtaEn: z.string().trim().min(1).max(100),
    whatsappCtaUr: z.string().trim().min(1).max(100),
    requestCtaEn: z.string().trim().min(1).max(100),
    requestCtaUr: z.string().trim().min(1).max(100),
    trustBadges: z.array(localizedPairSchema).min(1).max(8),
    processCards: z.array(contentBlockSchema).min(1).max(6),
  }),
  sections: sectionsSchema,
  optionsNoteEn: z.string().trim().min(1).max(2000),
  optionsNoteUr: z.string().trim().min(1).max(2000),
  howItWorksSteps: z.array(contentBlockSchema).min(1).max(8),
  whyChooseItems: z.array(contentBlockSchema).min(1).max(10),
  vehicleVisual: z.object({
    imagePath: z.string().trim().min(1).max(500),
    imageAltEn: z.string().trim().min(1).max(300),
    imageAltUr: z.string().trim().min(1).max(300),
    featurePoints: z.array(contentBlockSchema).min(1).max(6),
    browseCtaEn: z.string().trim().min(1).max(100),
    browseCtaUr: z.string().trim().min(1).max(100),
    whatsappCtaEn: z.string().trim().min(1).max(100),
    whatsappCtaUr: z.string().trim().min(1).max(100),
    requestCtaEn: z.string().trim().min(1).max(100),
    requestCtaUr: z.string().trim().min(1).max(100),
  }),
  about: z.object({
    titleEn: z.string().trim().min(1).max(300),
    titleUr: z.string().trim().min(1).max(300),
    descriptionEn: z.string().trim().min(1).max(5000),
    descriptionUr: z.string().trim().min(1).max(5000),
    additionalEn: z.string().trim().min(1).max(5000),
    additionalUr: z.string().trim().min(1).max(5000),
    ctaEn: z.string().trim().min(1).max(200),
    ctaUr: z.string().trim().min(1).max(200),
    trustCards: z.array(contentBlockSchema).min(1).max(8),
  }),
  limits: z.object({
    faqCount: z.coerce.number().int().min(1).max(20),
    documentCount: z.coerce.number().int().min(1).max(20),
    blogCount: z.coerce.number().int().min(1).max(12),
    guideCount: z.coerce.number().int().min(1).max(12),
    popularCount: z.coerce.number().int().min(4).max(6),
  }),
  footerDescriptionEn: z.string().trim().min(1).max(2000),
  footerDescriptionUr: z.string().trim().min(1).max(2000),
  seo: z.object({
    metaTitleEn: z.string().trim().min(1).max(200),
    metaTitleUr: z.string().trim().min(1).max(200),
    metaDescriptionEn: z.string().trim().min(1).max(500),
    metaDescriptionUr: z.string().trim().min(1).max(500),
    h1En: z.string().trim().min(1).max(300),
    h1Ur: z.string().trim().min(1).max(300),
  }),
});
