import { z } from "zod";

import { seoMetaInputSchema } from "@/lib/validations/admin-seo";
import { serviceSlugSchema } from "@/lib/validations/admin-service";

const idListSchema = z.array(z.string().cuid()).max(20).default([]);

export const guideCoreSchema = z.object({
  slug: serviceSlugSchema,
  titleEn: z.string().trim().min(2).max(200),
  excerptEn: z.string().trim().max(5000).optional().nullable(),
  contentEn: z.string().trim().min(1).max(100000),
  relatedServiceIds: idListSchema,
  attachedFaqIds: idListSchema,
  isPublished: z.boolean().default(false),
  seo: seoMetaInputSchema.optional()});

export const createGuideSchema = guideCoreSchema;

export const updateGuideSchema = guideCoreSchema.extend({
  id: z.string().cuid()});

export const guideIdSchema = z.object({
  id: z.string().cuid()});

export const toggleGuideSchema = z.object({
  id: z.string().cuid(),
  isPublished: z.boolean()});
