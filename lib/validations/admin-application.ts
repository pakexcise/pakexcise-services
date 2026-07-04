import { z } from "zod";

import { applicationStatuses } from "@/config/app";
import { localeSchema } from "@/lib/validations/common";
import { entityIdSchema, nullableEntityIdSchema } from "@/lib/validations/entity-id";

const applicationStatusSchema = z.enum(applicationStatuses);

const adminApplicationBaseSchema = z.object({
  userId: entityIdSchema,
  serviceId: entityIdSchema,
  agentId: nullableEntityIdSchema,
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

export const adminUpdateApplicationSchema = z.object({
  id: entityIdSchema,
  status: applicationStatusSchema,
  statusChangeNote: z
    .string()
    .trim()
    .max(500, "Status note is too long")
    .optional()
    .default(""),
  adminNotes: z.string().trim().max(5000).optional().nullable(),
  locale: localeSchema.optional(),
  userId: entityIdSchema.optional(),
  serviceId: entityIdSchema.optional(),
  agentId: nullableEntityIdSchema.optional(),
});

export const deleteApplicationSchema = z.object({
  id: entityIdSchema,
});
