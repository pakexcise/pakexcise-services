import { z } from "zod";

export const jsonObjectSchema = z
  .union([z.record(z.unknown()), z.array(z.unknown()), z.null()])
  .optional()
  .nullable();

export const seoMetaInputSchema = z.object({
  metaTitleEn: z.string().trim().max(200).optional().nullable(),
  metaTitleUr: z.string().trim().max(200).optional().nullable(),
  metaDescriptionEn: z.string().trim().max(5000).optional().nullable(),
  metaDescriptionUr: z.string().trim().max(5000).optional().nullable(),
  h1En: z.string().trim().max(200).optional().nullable(),
  h1Ur: z.string().trim().max(200).optional().nullable(),
  canonicalUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  ogTitleEn: z.string().trim().max(200).optional().nullable(),
  ogTitleUr: z.string().trim().max(200).optional().nullable(),
  ogDescriptionEn: z.string().trim().max(5000).optional().nullable(),
  ogDescriptionUr: z.string().trim().max(5000).optional().nullable(),
  ogImage: z.string().trim().url().optional().nullable().or(z.literal("")),
  twitterCard: z.enum(["summary", "summary_large_image"]).optional().nullable(),
  robotsIndex: z.boolean().default(true),
  robotsFollow: z.boolean().default(true),
  faqSchemaJson: jsonObjectSchema,
  breadcrumbJson: jsonObjectSchema,
});

export type SeoMetaInput = z.infer<typeof seoMetaInputSchema>;
