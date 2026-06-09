import { z } from "zod";

export const presignUploadRequestSchema = z.object({
  applicationId: z.string().cuid(),
  requirementId: z.string().cuid().optional(),
  docType: z.string().trim().min(1).max(80),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(120),
  fileSize: z.number().int().positive(),
});

export const confirmDocumentUploadSchema = z.object({
  documentId: z.string().cuid(),
  applicationId: z.string().cuid().optional(),
  checksum: z
    .string()
    .trim()
    .regex(/^[a-f0-9]{64}$/i)
    .optional(),
});

export const rejectDocumentSchema = z.object({
  documentId: z.string().cuid(),
  reason: z.string().trim().min(3).max(500),
});

export const approveDocumentSchema = z.object({
  documentId: z.string().cuid(),
});

export const deleteDocumentSchema = z.object({
  documentId: z.string().cuid(),
});

export const signedUrlPurposeSchema = z.enum(["view", "proof"]);
