import { z } from "zod";

import { paginationSchema } from "@/lib/validations/common";
import { serviceSeoSchema, serviceSlugSchema } from "@/lib/validations/admin-service";

export const regionCoreSchema = z.object({
  slug: serviceSlugSchema,
  nameEn: z.string().trim().min(2).max(200),
  nameUr: z.string().trim().min(2).max(200),
  descriptionEn: z.string().trim().max(10000).optional().nullable(),
  descriptionUr: z.string().trim().max(10000).optional().nullable(),
  isActive: z.boolean().default(true),
  showInFooter: z.boolean().default(false),
  footerDisplayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const createRegionSchema = regionCoreSchema.extend({
  seo: serviceSeoSchema.optional(),
});

export const updateRegionSchema = regionCoreSchema.extend({
  id: z.string().cuid(),
  seo: serviceSeoSchema.optional(),
});

export const regionListFiltersSchema = paginationSchema.extend({
  q: z.string().trim().optional(),
  active: z.enum(["true", "false", "all"]).optional().default("all"),
});

export const regionIdSchema = z.object({
  id: z.string().cuid(),
});

export const toggleRegionSchema = z.object({
  id: z.string().cuid(),
  isActive: z.boolean(),
});

export const reorderRegionsSchema = z.object({
  orderedIds: z.array(z.string().cuid()).min(1),
});

export const deleteRegionSchema = regionIdSchema;
