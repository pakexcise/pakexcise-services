import { z } from "zod";

import { paginationSchema } from "@/lib/validations/common";
import { serviceSlugSchema } from "@/lib/validations/admin-service";

export const blogCategoryCoreSchema = z.object({
  slug: serviceSlugSchema,
  nameEn: z.string().trim().min(2).max(200),
  parentId: z.string().cuid().optional().nullable(),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const createBlogCategorySchema = blogCategoryCoreSchema;

export const updateBlogCategorySchema = blogCategoryCoreSchema.extend({
  id: z.string().cuid(),
});

export const blogCategoryIdSchema = z.object({
  id: z.string().cuid(),
});

export const toggleBlogCategorySchema = z.object({
  id: z.string().cuid(),
  isActive: z.boolean(),
});

export const blogCategoryListFiltersSchema = paginationSchema.extend({
  q: z.string().trim().optional(),
  active: z.enum(["true", "false", "all"]).optional().default("all"),
  level: z.enum(["all", "parent", "sub"]).optional().default("all"),
});
