import { z } from "zod";

/** Matches Prisma/Better Auth string primary keys used across the app. */
export const entityIdSchema = z
  .string()
  .trim()
  .min(1, "Invalid id")
  .max(64, "Invalid id");

export const nullableEntityIdSchema = z
  .union([entityIdSchema, z.literal(""), z.null()])
  .optional()
  .transform((value) => (value === "" || value === undefined ? null : value));
