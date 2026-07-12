import { z } from "zod";

import { seoMetaInputSchema } from "@/lib/validations/admin-seo";
import { serviceSlugSchema } from "@/lib/validations/admin-service";

const idListSchema = z.array(z.string().cuid()).max(20).default([]);

const blogContentFaqSchema = z.object({
  questionEn: z.string().trim().min(2).max(500),
  answerEn: z.string().trim().min(2).max(10000),
});

const blogExtendedFieldsSchema = z.object({
  categoryEn: z.string().trim().max(120).optional().nullable(),
  categoryId: z.string().cuid().optional().nullable(),
  subCategoryId: z.string().cuid().optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  authorNameEn: z.string().trim().max(120).optional().nullable(),
  readingTimeMinutes: z.coerce.number().int().min(1).max(240).optional().nullable(),
  featuredImagePath: z.string().trim().max(500).optional().nullable(),
  featuredImageTitleEn: z.string().trim().max(200).optional().nullable(),
  featuredImageAltEn: z.string().trim().max(300).optional().nullable(),
  featuredImageCaptionEn: z.string().trim().max(1000).optional().nullable(),
  focusKeywords: z.string().trim().max(500).optional().nullable(),
  isFeatured: z.boolean().default(false),
  showTableOfContents: z.boolean().default(true),
  contentFaqs: z.array(blogContentFaqSchema).max(30).default([]),
  ctaTitleEn: z.string().trim().max(200).optional().nullable(),
  ctaDescriptionEn: z.string().trim().max(2000).optional().nullable(),
  ctaWhatsappLabelEn: z.string().trim().max(120).optional().nullable(),
  ctaRequestLabelEn: z.string().trim().max(120).optional().nullable(),
  ctaAccountLabelEn: z.string().trim().max(120).optional().nullable(),
});

export const blogPostCoreSchema = z
  .object({
    slug: serviceSlugSchema,
    titleEn: z.string().trim().min(2).max(200),
    excerptEn: z.string().trim().max(5000).optional().nullable(),
    contentEn: z.string().trim().min(1).max(100000),
    relatedServiceIds: idListSchema,
    attachedFaqIds: idListSchema,
    isPublished: z.boolean().default(false),
    seo: seoMetaInputSchema.optional(),
  })
  .merge(blogExtendedFieldsSchema);

export const createBlogPostSchema = blogPostCoreSchema;

export const updateBlogPostSchema = blogPostCoreSchema.extend({
  id: z.string().cuid(),
});

export const blogPostIdSchema = z.object({
  id: z.string().cuid(),
});

export const toggleBlogPostSchema = z.object({
  id: z.string().cuid(),
  isPublished: z.boolean(),
});

export const blogListFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional(),
  status: z.enum(["published", "draft", "all"]).optional().default("all"),
  category: z.string().trim().optional(),
  tag: z.string().trim().optional(),
});
