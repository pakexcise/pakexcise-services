import { z } from "zod";

import { paginationSchema } from "@/lib/validations/common";
import { serviceSlugSchema } from "@/lib/validations/admin-service";

export const serviceCategoryCoreSchema = z.object({
  slug: serviceSlugSchema,
  nameEn: z.string().trim().min(2).max(200),
  nameUr: z.string().trim().min(2).max(200),
  descriptionEn: z.string().trim().max(10000).optional().nullable(),
  descriptionUr: z.string().trim().max(10000).optional().nullable(),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const createServiceCategorySchema = serviceCategoryCoreSchema;

export const updateServiceCategorySchema = serviceCategoryCoreSchema.extend({
  id: z.string().cuid(),
});

export const serviceCategoryIdSchema = z.object({
  id: z.string().cuid(),
});

export const toggleServiceCategorySchema = z.object({
  id: z.string().cuid(),
  isActive: z.boolean(),
});

export const reorderServiceCategoriesSchema = z.object({
  orderedIds: z.array(z.string().cuid()).min(1),
});

export const serviceCategoryListFiltersSchema = paginationSchema.extend({
  q: z.string().trim().optional(),
  active: z.enum(["true", "false", "all"]).optional().default("all"),
});
