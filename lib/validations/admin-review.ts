import { z } from "zod";

export const reviewCoreSchema = z.object({
  authorNameEn: z.string().trim().min(2).max(100),
  authorRoleEn: z.string().trim().max(120).optional().default(""),
  contentEn: z.string().trim().min(20).max(1200),
  rating: z.coerce.number().int().min(1).max(5),
  isActive: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const createReviewSchema = reviewCoreSchema;

export const updateReviewSchema = reviewCoreSchema.extend({
  id: z.string().cuid(),
});

export const reviewIdSchema = z.object({
  id: z.string().cuid(),
});

export const toggleReviewSchema = z.object({
  id: z.string().cuid(),
  isActive: z.boolean(),
});

export const reorderReviewsSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().cuid(),
        displayOrder: z.number().int().min(0).max(9999),
      }),
    )
    .min(1)
    .max(100),
});
