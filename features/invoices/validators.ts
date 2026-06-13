import { z } from "zod";

import { localeSchema } from "@/lib/validations/common";

const moneyAmountSchema = z
  .coerce
  .number()
  .min(0, "Amount cannot be negative")
  .max(9_999_999.99, "Amount is too large")
  .refine(
    (value) => Math.round(value * 100) === value * 100,
    "Amount can have at most 2 decimal places",
  );

const optionalInvoiceNoteSchema = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

export const invoiceLineItemInputSchema = z.object({
  label: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  amount: moneyAmountSchema,
  isOfficialFee: z.boolean().default(false),
});

export const createInvoiceSchema = z.object({
  applicationId: z.string().cuid(),
  locale: localeSchema,
  serviceFee: moneyAmountSchema,
  officialFeeNote: optionalInvoiceNoteSchema,
  lineItems: z.array(invoiceLineItemInputSchema).max(20).default([]),
  paymentMethodIds: z
    .array(z.string().cuid())
    .min(1, "Select at least one payment method")
    .max(10),
  paymentInstructions: optionalInvoiceNoteSchema,
  dueAt: z.string().datetime().optional(),
  notes: optionalInvoiceNoteSchema,
  taxTotal: moneyAmountSchema.default(0),
  statusNote: z
    .string()
    .trim()
    .min(3, "Status note is required")
    .max(2000),
});

export const invoiceIdSchema = z.object({
  invoiceId: z.string().cuid(),
});

export const updateInvoiceSchema = createInvoiceSchema
  .omit({ applicationId: true, statusNote: true })
  .extend({
    invoiceId: z.string().cuid(),
    editNote: z
      .string()
      .trim()
      .min(3, "Edit note is required")
      .max(2000),
  });
