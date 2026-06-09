import { z } from "zod";

const adminPipelineStatusSchema = z.enum([
  "SUBMITTED",
  "REVIEW",
  "DOCS_REQUIRED",
  "INVOICE_SENT",
  "PAYMENT_UPLOADED",
  "PAYMENT_VERIFIED",
  "IN_PROGRESS",
  "AT_OFFICE",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
]);

export const transitionApplicationStatusSchema = z.object({
  applicationId: z.string().cuid(),
  toStatus: adminPipelineStatusSchema,
  note: z
    .string()
    .trim()
    .min(3, "A status note is required")
    .max(2000, "Note is too long"),
});

export const updateAdminNotesSchema = z.object({
  applicationId: z.string().cuid(),
  notes: z.string().trim().max(10000, "Notes are too long"),
});

export const bulkAssignApplicationsSchema = z.object({
  applicationIds: z.array(z.string().cuid()).min(1).max(50),
  agentId: z.string().cuid().optional(),
});

export const uploadCompletionProofSchema = z.object({
  applicationId: z.string().cuid(),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(120),
  fileSize: z.number().int().positive(),
});

export const confirmCompletionProofSchema = z.object({
  applicationId: z.string().cuid(),
  documentId: z.string().cuid(),
  checksum: z
    .string()
    .trim()
    .regex(/^[a-f0-9]{64}$/i)
    .optional(),
});

export const adminApplicationListFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: adminPipelineStatusSchema.optional(),
  serviceId: z.string().cuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  q: z.string().trim().max(120).optional(),
});

export type TransitionApplicationStatusInput = z.infer<
  typeof transitionApplicationStatusSchema
>;
export type UpdateAdminNotesInput = z.infer<typeof updateAdminNotesSchema>;
export type BulkAssignApplicationsInput = z.infer<
  typeof bulkAssignApplicationsSchema
>;
