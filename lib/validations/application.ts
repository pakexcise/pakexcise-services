import { z } from "zod";

import { basicApplicantDetailsSchema } from "@/features/applications/lib/basic-details-schema";
import { localeSchema } from "@/lib/validations/common";

export const attributionSchema = z.object({
  firstTouchSource: z.string().trim().max(120).optional(),
  firstTouchMedium: z.string().trim().max(120).optional(),
  firstTouchCampaign: z.string().trim().max(120).optional(),
  lastTouchSource: z.string().trim().max(120).optional(),
  lastTouchCampaign: z.string().trim().max(120).optional(),
  gclid: z.string().trim().max(200).optional(),
  fbclid: z.string().trim().max(200).optional(),
  ttclid: z.string().trim().max(200).optional(),
  landingPage: z.string().trim().max(500).optional(),
  referrer: z.string().trim().max(500).optional(),
  deviceType: z.string().trim().max(40).optional(),
});

export const saveApplicationDraftSchema = z.object({
  applicationId: z.string().cuid().optional(),
  serviceSlug: z.string().trim().min(1),
  currentStep: z.number().int().min(1).max(4),
  locale: localeSchema,
  basic: basicApplicantDetailsSchema.partial().optional(),
  fields: z.record(z.union([z.string(), z.array(z.string()), z.boolean()])).optional(),
  documents: z
    .record(
      z.object({
        documentId: z.string().cuid(),
        fileName: z.string().trim().min(1).max(255),
        mimeType: z.string().trim().min(1).max(120),
        fileSize: z.number().int().positive(),
      }),
    )
    .optional(),
  attribution: attributionSchema.optional(),
});

export const changeApplicationServiceSchema = z.object({
  applicationId: z.string().cuid(),
  newServiceSlug: z.string().trim().min(1),
  basic: basicApplicantDetailsSchema,
});

export const submitApplicationSchema = z.object({
  analyticsEventId: z.string().uuid().optional(),
  applicationId: z.string().cuid(),
  locale: localeSchema,
  basic: basicApplicantDetailsSchema,
  fields: z.record(z.union([z.string(), z.array(z.string()), z.boolean()])),
  attribution: attributionSchema.optional(),
});

export const requestDocumentUploadSchema = z.object({
  applicationId: z.string().cuid(),
  requirementId: z.string().cuid(),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(120),
  fileSize: z.number().int().positive(),
});

export const confirmDocumentUploadSchema = z.object({
  applicationId: z.string().cuid(),
  documentId: z.string().cuid(),
});
