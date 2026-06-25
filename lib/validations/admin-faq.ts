import { z } from "zod";

import { paginationSchema } from "@/lib/validations/common";

const faqAnswerSchema = z
  .string()
  .trim()
  .min(1, "Answer is required")
  .max(20000, "Answer is too long")
  .refine(
    (value) => !/<script|javascript:|on\w+\s*=/i.test(value),
    "Answer contains unsafe content",
  );

export const faqCoreSchema = z.object({
  questionEn: z.string().trim().min(2).max(500),
  questionUr: z.string().trim().min(2).max(500),
  answerEn: faqAnswerSchema,
  answerUr: faqAnswerSchema,
  categoryId: z.string().cuid("Select a valid category"),
  serviceId: z.string().cuid().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  featuredDisplayOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const createFaqSchema = faqCoreSchema;

export const updateFaqSchema = faqCoreSchema.extend({
  id: z.string().cuid(),
});

export const faqIdSchema = z.object({
  id: z.string().cuid(),
});

export const toggleFaqSchema = z.object({
  id: z.string().cuid(),
  isActive: z.boolean(),
});

export const reorderFaqsSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().cuid(),
        displayOrder: z.number().int().min(0).max(9999),
      }),
    )
    .min(1)
    .max(500),
});

export const faqListFiltersSchema = paginationSchema.extend({
  q: z.string().trim().optional(),
  categoryId: z.string().cuid().optional(),
  serviceId: z.string().cuid().optional(),
  active: z.enum(["true", "false", "all"]).optional().default("all"),
  featured: z.enum(["true", "false", "all"]).optional().default("all"),
});
