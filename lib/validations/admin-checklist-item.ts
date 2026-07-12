import { z } from "zod";

export const checklistItemTypeSchema = z.enum([
  "DOCUMENT",
  "TEXT_FIELD",
  "SELECT_FIELD",
  "NOTE",
  "BIOMETRIC",
  "INSPECTION",
  "DELIVERY_INSTRUCTION"]);

export const checklistItemSchema = z.object({
  id: z.string().cuid().optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens"),
  nameEn: z.string().trim().min(2).max(200),
  descriptionEn: z.string().trim().max(5000).optional().nullable(),
  itemType: checklistItemTypeSchema.default("DOCUMENT"),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isActive: z.boolean().default(true)});

export const deleteChecklistItemSchema = z.object({
  id: z.string().cuid()});

export type ChecklistItemInput = z.infer<typeof checklistItemSchema>;
