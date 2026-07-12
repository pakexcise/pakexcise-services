import { z } from "zod";

/** Accepts empty string, absolute URL, or site-relative path (e.g. /blog/image.webp). */
export const seoPathOrUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) =>
      value === "" || value.startsWith("/") || /^https?:\/\//i.test(value),
    { message: "Enter a full URL or a path starting with /" },
  );

export const jsonObjectSchema = z
  .union([z.record(z.unknown()), z.array(z.unknown()), z.null()])
  .optional()
  .nullable();

export const seoMetaInputSchema = z.object({
  metaTitleEn: z.string().trim().max(200).optional().nullable(),
  metaDescriptionEn: z.string().trim().max(5000).optional().nullable(),
  h1En: z.string().trim().max(200).optional().nullable(),
  canonicalUrl: seoPathOrUrlSchema.optional().nullable().or(z.literal("")),
  ogTitleEn: z.string().trim().max(200).optional().nullable(),
  ogDescriptionEn: z.string().trim().max(5000).optional().nullable(),
  ogImage: seoPathOrUrlSchema.optional().nullable().or(z.literal("")),
  twitterCard: z.enum(["summary", "summary_large_image"]).optional().nullable(),
  robotsIndex: z.boolean().default(true),
  robotsFollow: z.boolean().default(true),
  faqSchemaJson: jsonObjectSchema,
  breadcrumbJson: jsonObjectSchema,
});

export type SeoMetaInput = z.infer<typeof seoMetaInputSchema>;
