import { z } from "zod";

import { seoMetaInputSchema } from "@/lib/validations/admin-seo";
import { serviceSlugSchema } from "@/lib/validations/admin-service";

const idListSchema = z.array(z.string().cuid()).max(20).default([]);

export const blogPostCoreSchema = z.object({
  slug: serviceSlugSchema,
  titleEn: z.string().trim().min(2).max(200),
  titleUr: z.string().trim().min(2).max(200),
  excerptEn: z.string().trim().max(5000).optional().nullable(),
  excerptUr: z.string().trim().max(5000).optional().nullable(),
  contentEn: z.string().trim().min(1).max(100000),
  contentUr: z.string().trim().min(1).max(100000),
  relatedServiceIds: idListSchema,
  attachedFaqIds: idListSchema,
  isPublished: z.boolean().default(false),
  seo: seoMetaInputSchema.optional(),
});

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
});
