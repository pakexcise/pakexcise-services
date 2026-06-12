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
  officialFeeNote: z.string().trim().max(2000).optional(),
  lineItems: z.array(invoiceLineItemInputSchema).max(20).default([]),
  paymentMethodIds: z
    .array(z.string().cuid())
    .min(1, "Select at least one payment method")
    .max(10),
  paymentInstructions: z.string().trim().max(2000).optional(),
  dueAt: z.string().datetime().optional(),
  notes: z.string().trim().max(2000).optional(),
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
