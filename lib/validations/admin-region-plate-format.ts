import { z } from "zod";

import { isVehiclePlateType } from "@/features/regions/lib/vehicle-plate-types";

const stringListSchema = z
  .array(z.string().trim().min(1).max(80))
  .min(1)
  .max(20);

const optionalStringListSchema = z
  .array(z.string().trim().min(1).max(120))
  .max(12)
  .optional()
  .nullable();

const faqItemSchema = z.object({
  questionEn: z.string().trim().min(1).max(300),
  answerEn: z.string().trim().min(1).max(2000)});

export const upsertRegionPlateFormatSectionSchema = z.object({
  regionId: z.string().trim().min(1),
  sectionTitleEn: z.string().trim().max(200).optional().nullable(),
  sectionDescEn: z.string().trim().max(4000).optional().nullable(),
  faqJson: z.array(faqItemSchema).max(12).optional().nullable(),
  isActive: z.boolean().default(true),
  showOnRegionPage: z.boolean().default(true)});

export const upsertRegionNumberPlateFormatSchema = z.object({
  id: z.string().trim().min(1).optional(),
  regionId: z.string().trim().min(1),
  vehicleType: z
    .string()
    .trim()
    .refine(isVehiclePlateType, "Invalid vehicle type"),
  titleEn: z.string().trim().min(1).max(200),
  formats: stringListSchema,
  descriptionEn: z.string().trim().max(4000).optional().nullable(),
  relatedServiceSlugs: optionalStringListSchema,
  imageAltEn: z.string().trim().max(200).optional().nullable(),
  imageCaptionEn: z.string().trim().max(300).optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  showOnRegionPage: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0)});

export const deleteRegionNumberPlateFormatSchema = z.object({
  id: z.string().trim().min(1)});

export const reorderRegionNumberPlateFormatsSchema = z.object({
  regionId: z.string().trim().min(1),
  orderedIds: z.array(z.string().trim().min(1)).min(1).max(100)});

export const regionPlateFormatIdSchema = z.object({
  id: z.string().trim().min(1)});
