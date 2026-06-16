import { z } from "zod";

import { applicationStatuses } from "@/config/app";
import { localeSchema } from "@/lib/validations/common";

const applicationStatusSchema = z.enum(applicationStatuses);

const adminApplicationCoreSchema = z.object({
  userId: z.string().cuid(),
  serviceId: z.string().cuid(),
  agentId: z.string().cuid().optional().nullable(),
  locale: localeSchema,
  status: applicationStatusSchema,
  adminNotes: z.string().trim().max(5000).optional().nullable(),
  statusChangeNote: z.string().trim().min(3).max(500),
});

export const adminCreateApplicationSchema = adminApplicationCoreSchema;

export const adminUpdateApplicationSchema = adminApplicationCoreSchema.extend({
  id: z.string().cuid(),
});

export const deleteApplicationSchema = z.object({
  id: z.string().cuid(),
});
