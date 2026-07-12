import { z } from "zod";

import { paginationSchema } from "@/lib/validations/common";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const serviceSlugSchema = z
  .string()
  .trim()
  .min(2, "Slug must be at least 2 characters")
  .max(120, "Slug is too long")
  .regex(slugRegex, "Slug must be lowercase letters, numbers, and hyphens");

export const localizedTextSchema = z.object({
  en: z.string().trim().min(1, "English value is required"),
});

export const optionalLocalizedTextSchema = z.object({
  en: z.string().trim().optional().default(""),
});

export const jsonObjectSchema = z
  .union([z.record(z.unknown()), z.array(z.unknown()), z.null()])
  .optional()
  .nullable();

export const serviceSeoSchema = z.object({
  metaTitleEn: z.string().trim().optional().nullable(),
  metaDescriptionEn: z.string().trim().optional().nullable(),
  h1En: z.string().trim().optional().nullable(),
  canonicalUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  ogTitleEn: z.string().trim().optional().nullable(),
  ogDescriptionEn: z.string().trim().optional().nullable(),
  ogImage: z.string().trim().url().optional().nullable().or(z.literal("")),
  twitterCard: z.enum(["summary", "summary_large_image"]).optional().nullable(),
  robotsIndex: z.boolean().default(true),
  robotsFollow: z.boolean().default(true),
  faqSchemaJson: jsonObjectSchema,
  breadcrumbJson: jsonObjectSchema});

export const serviceCoreSchema = z.object({
  slug: serviceSlugSchema,
  categoryId: z.string().cuid().optional().nullable(),
  parentServiceId: z.string().cuid().optional().nullable(),
  regionIds: z.array(z.string().cuid()).min(1, "Select at least one province"),
  nameEn: z.string().trim().min(2).max(200),
  shortDescriptionEn: z.string().trim().max(5000).optional().nullable(),
  contentEn: z.string().trim().max(50000).optional().nullable(),
  ctaTextEn: z.string().trim().max(200).optional().nullable(),
  processingNotesEn: z.string().trim().max(10000).optional().nullable(),
  internalNotes: z.string().trim().max(10000).optional().nullable(),
  referenceLinksJson: jsonObjectSchema,
  requiresProof: z.boolean().default(true),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  featuredDisplayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  showInFooter: z.boolean().default(false),
  footerDisplayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0)});

export const createServiceSchema = serviceCoreSchema.extend({
  seo: serviceSeoSchema.optional()});

export const updateServiceSchema = serviceCoreSchema.extend({
  id: z.string().cuid(),
  seo: serviceSeoSchema.optional()});

export const serviceListFiltersSchema = paginationSchema.extend({
  q: z.string().trim().optional(),
  regionId: z.string().cuid().optional(),
  active: z.enum(["true", "false", "all"]).optional().default("all")});

export const serviceIdSchema = z.object({
  id: z.string().cuid()});

export const reorderServicesSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().cuid(),
        displayOrder: z.number().int().min(0).max(9999)}),
    )
    .min(1)
    .max(200)});

export const toggleServiceSchema = z.object({
  id: z.string().cuid(),
  isActive: z.boolean()});

export const fieldTypeSchema = z.enum([
  "TEXT",
  "TEXTAREA",
  "NUMBER",
  "DATE",
  "SELECT",
  "MULTI_SELECT",
  "RADIO",
  "CHECKBOX",
  "FILE",
  "EMAIL",
  "PHONE",
  "CNIC"]);

export const documentRequirementSchema = z.object({
  id: z.string().cuid().optional(),
  serviceId: z.string().cuid(),
  regionId: z.string().cuid().optional().nullable(),
  checklistItemId: z.string().cuid().optional().nullable(),
  docType: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, and underscores"),
  kind: z
    .enum(["FILE", "NOTE", "BIOMETRIC", "INSPECTION", "DELIVERY"])
    .default("FILE"),
  labelEn: z.string().trim().min(2).max(200),
  instructionsEn: z.string().trim().max(5000).optional().nullable(),
  isRequired: z.boolean().default(true),
  maxSizeBytes: z.coerce.number().int().min(1024).max(52428800).default(5242880),
  acceptedMimeTypes: z
    .array(z.string().trim().min(3))
    .min(1, "At least one MIME type is required"),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isActive: z.boolean().default(true)});

export const deleteDocumentRequirementSchema = z.object({
  id: z.string().cuid(),
  serviceId: z.string().cuid()});

export const serviceFormFieldSchema = z.object({
  id: z.string().cuid().optional(),
  serviceId: z.string().cuid(),
  regionId: z.string().cuid().optional().nullable(),
  fieldKey: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, and underscores"),
  labelEn: z.string().trim().min(2).max(200),
  placeholderEn: z.string().trim().max(200).optional().nullable(),
  helpTextEn: z.string().trim().max(2000).optional().nullable(),
  fieldType: fieldTypeSchema,
  isRequired: z.boolean().default(false),
  isEncrypted: z.boolean().default(false),
  optionsJson: jsonObjectSchema,
  validationJson: jsonObjectSchema,
  conditionalJson: jsonObjectSchema,
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isActive: z.boolean().default(true)});

export const deleteServiceFormFieldSchema = z.object({
  id: z.string().cuid(),
  serviceId: z.string().cuid()});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type DocumentRequirementInput = z.infer<typeof documentRequirementSchema>;
export type ServiceFormFieldInput = z.infer<typeof serviceFormFieldSchema>;
