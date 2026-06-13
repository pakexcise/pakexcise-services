import { z } from "zod";

import { normalizePakistanPhone } from "@/lib/validations/phone";

export const updateAgentProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .min(1)
    .regex(/^(\+92|0)?3\d{9}$/),
});

export const updateAgentPayoutMethodSchema = z.object({
  payoutMethodType: z.enum([
    "BANK_TRANSFER",
    "JAZZCASH",
    "EASYPAISA",
    "NAYAPAY",
    "SADAPAY",
    "OTHER",
  ]),
  payoutAccountTitle: z.string().trim().min(2).max(120),
  payoutAccountNumber: z.string().trim().max(64).optional(),
  payoutIban: z.string().trim().max(34).optional(),
  payoutBankName: z.string().trim().max(120).optional(),
  payoutWalletNumber: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (!value) {
        return undefined;
      }

      const normalized = normalizePakistanPhone(value);
      return normalized ?? value;
    }),
  payoutNotes: z.string().trim().max(2000).optional(),
});

export const confirmAgentCommissionReceiptSchema = z.object({
  commissionId: z.string().cuid(),
});

export const updateAgentCommissionReceiptSchema = z
  .object({
    commissionId: z.string().cuid(),
    status: z.enum(["RECEIVED", "NOT_RECEIVED"]),
    reason: z.string().trim().max(2000).optional(),
  })
  .superRefine((value, ctx) => {
    if (
      value.status === "NOT_RECEIVED" &&
      (!value.reason || value.reason.trim().length < 3)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please explain why payment was not received",
        path: ["reason"],
      });
    }
  });
