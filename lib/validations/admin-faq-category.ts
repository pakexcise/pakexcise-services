import { z } from "zod";

import { paginationSchema } from "@/lib/validations/common";
import { serviceSlugSchema } from "@/lib/validations/admin-service";

export const faqCategoryCoreSchema = z.object({
  slug: serviceSlugSchema,
  nameEn: z.string().trim().min(2).max(200),
  descriptionEn: z.string().trim().max(10000).optional().nullable(),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0)});

export const createFaqCategorySchema = faqCategoryCoreSchema;

export const updateFaqCategorySchema = faqCategoryCoreSchema.extend({
  id: z.string().cuid()});

export const faqCategoryIdSchema = z.object({
  id: z.string().cuid()});

export const toggleFaqCategorySchema = z.object({
  id: z.string().cuid(),
  isActive: z.boolean()});

export const faqCategoryListFiltersSchema = paginationSchema.extend({
  q: z.string().trim().optional(),
  active: z.enum(["true", "false", "all"]).optional().default("all")});
