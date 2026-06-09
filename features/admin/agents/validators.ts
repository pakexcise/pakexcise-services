import { z } from "zod";

const moneyAmountSchema = z.coerce
  .number()
  .min(0)
  .max(9_999_999.99)
  .refine(
    (value) => Math.round(value * 100) === value * 100,
    "Amount can have at most 2 decimal places",
  );

export const agentProfileIdSchema = z.object({
  agentProfileId: z.string().cuid(),
});

export const rejectAgentSchema = z.object({
  agentProfileId: z.string().cuid(),
  notes: z.string().trim().min(3).max(2000),
});

export const updateAgentCommissionRateSchema = z.object({
  agentProfileId: z.string().cuid(),
  commissionRate: z.coerce.number().min(0).max(100),
});

export const toggleAgentActiveSchema = z.object({
  agentProfileId: z.string().cuid(),
  isActive: z.boolean(),
});

export const createAgentCommissionSchema = z.object({
  agentProfileId: z.string().cuid(),
  applicationId: z.string().cuid().optional(),
  label: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  amount: moneyAmountSchema,
  payoutStatus: z
    .enum(["PENDING", "PROCESSING", "PAID", "CANCELLED"])
    .default("PENDING"),
});

export const promoteUserToAgentSchema = z.object({
  userId: z.string().cuid(),
  notes: z.string().trim().max(2000).optional(),
});
