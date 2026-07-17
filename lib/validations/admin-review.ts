import { z } from "zod";

const reviewRatingSchema = z.coerce
  .number()
  .min(1)
  .max(5)
  .transform((value) => Math.round(value * 10) / 10);

export const reviewCoreSchema = z.object({
  authorNameEn: z.string().trim().min(2).max(100),
  authorRoleEn: z.string().trim().max(120).optional().default(""),
  contentEn: z.string().trim().min(20).max(1200),
  rating: reviewRatingSchema,
  isActive: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  serviceId: z.string().cuid().optional().nullable(),
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

export const approveReviewSchema = z.object({
  id: z.string().cuid(),
});

export const rejectReviewSchema = z.object({
  id: z.string().cuid(),
  moderationNote: z.string().trim().min(5).max(500),
});

export const bulkReviewIdsSchema = z.object({
  ids: z.array(z.string().cuid()).min(1).max(200),
});

export const bulkRejectReviewsSchema = bulkReviewIdsSchema.extend({
  moderationNote: z.string().trim().min(5).max(500),
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
