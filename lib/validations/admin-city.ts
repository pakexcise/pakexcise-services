import { z } from "zod";

import { paginationSchema } from "@/lib/validations/common";
import { serviceSeoSchema, serviceSlugSchema } from "@/lib/validations/admin-service";

export const cityCoreSchema = z.object({
  regionId: z.string().cuid(),
  slug: serviceSlugSchema,
  nameEn: z.string().trim().min(2).max(200),
  descriptionEn: z.string().trim().max(10000).optional().nullable(),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0)});

export const createCitySchema = cityCoreSchema.extend({
  seo: serviceSeoSchema.optional()});

export const updateCitySchema = cityCoreSchema.extend({
  id: z.string().cuid(),
  seo: serviceSeoSchema.optional()});

export const cityListFiltersSchema = paginationSchema.extend({
  regionId: z.string().cuid().optional(),
  q: z.string().trim().optional(),
  active: z.enum(["true", "false", "all"]).optional().default("all")});

export const cityIdSchema = z.object({
  id: z.string().cuid()});

export const toggleCitySchema = z.object({
  id: z.string().cuid(),
  isActive: z.boolean()});

export const reorderCitiesSchema = z.object({
  regionId: z.string().cuid(),
  orderedIds: z.array(z.string().cuid()).min(1)});

export const deleteCitySchema = cityIdSchema;
