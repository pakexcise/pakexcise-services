import { z } from "zod";

import { seoMetaInputSchema } from "@/lib/validations/admin-seo";

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens");

export const legalPageContentFieldsSchema = z.object({
  titleEn: z.string().trim().min(2).max(200),
  excerptEn: z.string().trim().max(5000).optional().nullable(),
  contentEn: z.string().trim().min(1).max(100000),
  isPublished: z.boolean().default(false),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().min(0).max(9999).default(0),
  seo: seoMetaInputSchema.optional()});

export const createLegalPageSchema = legalPageContentFieldsSchema.extend({
  slug: slugSchema});

export const updateLegalPageSchema = legalPageContentFieldsSchema.extend({
  id: z.string().trim().min(1),
  slug: slugSchema.optional()});

export const legalPageIdSchema = z.object({
  id: z.string().trim().min(1)});

export const toggleLegalPagePublishSchema = z.object({
  id: z.string().trim().min(1),
  isPublished: z.boolean()});

export const toggleLegalPageActiveSchema = z.object({
  id: z.string().trim().min(1),
  isActive: z.boolean()});
