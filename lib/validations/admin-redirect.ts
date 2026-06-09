import { z } from "zod";

export const redirectCoreSchema = z.object({
  oldSlug: z.string().trim().min(1).max(200),
  newSlug: z.string().trim().min(1).max(200),
  statusCode: z.coerce.number().int().refine((v) => v === 301 || v === 302, {
    message: "Status code must be 301 or 302",
  }),
  isActive: z.boolean().default(true),
});

export const createRedirectSchema = redirectCoreSchema;

export const updateRedirectSchema = redirectCoreSchema.extend({
  id: z.string().cuid(),
});

export const redirectIdSchema = z.object({
  id: z.string().cuid(),
});

export const toggleRedirectSchema = z.object({
  id: z.string().cuid(),
  isActive: z.boolean(),
});
