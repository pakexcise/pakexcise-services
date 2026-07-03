import { z } from "zod";

import { applicationStatuses } from "@/config/app";
import { localeSchema } from "@/lib/validations/common";

const applicationStatusSchema = z.enum(applicationStatuses);

const nullableAgentIdSchema = z
  .union([z.string().cuid(), z.literal(""), z.null()])
  .optional()
  .transform((value) => (value === "" || value === undefined ? null : value));

const adminApplicationBaseSchema = z.object({
  userId: z.string().cuid(),
  serviceId: z.string().cuid(),
  agentId: nullableAgentIdSchema,
  locale: localeSchema,
  status: applicationStatusSchema,
  adminNotes: z.string().trim().max(5000).optional().nullable(),
});

export const adminCreateApplicationSchema = adminApplicationBaseSchema.extend({
  statusChangeNote: z
    .string()
    .trim()
    .min(3, "A status note is required")
    .max(500, "Status note is too long"),
});

export const adminUpdateApplicationSchema = adminApplicationBaseSchema.extend({
  id: z.string().cuid(),
  statusChangeNote: z
    .string()
    .trim()
    .max(500, "Status note is too long")
    .optional()
    .default(""),
});

export const deleteApplicationSchema = z.object({
  id: z.string().cuid(),
});
