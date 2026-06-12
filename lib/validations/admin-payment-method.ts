import { z } from "zod";

const codeSchema = z
  .string()
  .trim()
  .min(2)
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens");

const optionalText = z.string().trim().max(2000).optional().or(z.literal(""));

export const paymentMethodTypeSchema = z.enum([
  "BANK_TRANSFER",
  "JAZZCASH",
  "EASYPAISA",
  "NAYAPAY",
  "SADAPAY",
  "OTHER",
]);

export const paymentMethodCoreSchema = z.object({
  code: codeSchema,
  type: paymentMethodTypeSchema,
  nameEn: z.string().trim().min(1).max(120),
  nameUr: z.string().trim().min(1).max(120),
  accountTitleEn: optionalText,
  accountTitleUr: optionalText,
  accountNumber: z.string().trim().max(80).optional().or(z.literal("")),
  iban: z.string().trim().max(80).optional().or(z.literal("")),
  bankNameEn: z.string().trim().max(120).optional().or(z.literal("")),
  bankNameUr: z.string().trim().max(120).optional().or(z.literal("")),
  instructionsEn: optionalText,
  instructionsUr: optionalText,
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const createPaymentMethodSchema = paymentMethodCoreSchema;

export const updatePaymentMethodSchema = paymentMethodCoreSchema.extend({
  id: z.string().cuid(),
});

export const paymentMethodIdSchema = z.object({
  id: z.string().cuid(),
});

export const togglePaymentMethodSchema = z.object({
  id: z.string().cuid(),
  isActive: z.boolean(),
});

export const reorderPaymentMethodsSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().cuid(),
        displayOrder: z.number().int().min(0).max(9999),
      }),
    )
    .min(1)
    .max(50),
});
