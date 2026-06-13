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

export const updateAgentCommissionConfigSchema = z
  .object({
    agentProfileId: z.string().cuid(),
    commissionMode: z.enum(["MANUAL", "PERCENTAGE", "FIXED"]),
    commissionRate: z.coerce.number().min(0).max(100).optional(),
    commissionFixedAmount: moneyAmountSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.commissionMode === "PERCENTAGE") {
      if (value.commissionRate === undefined || value.commissionRate <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Commission rate is required for percentage mode",
          path: ["commissionRate"],
        });
      }
    }

    if (value.commissionMode === "FIXED") {
      if (
        value.commissionFixedAmount === undefined ||
        value.commissionFixedAmount <= 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Fixed amount is required for fixed mode",
          path: ["commissionFixedAmount"],
        });
      }
    }
  });

export const toggleAgentActiveSchema = z.object({
  agentProfileId: z.string().cuid(),
  isActive: z.boolean(),
});

export const createAgentCommissionSchema = z.object({
  agentProfileId: z.string().cuid(),
  trackingId: z.string().trim().min(8).max(40),
  label: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  amount: moneyAmountSchema,
});

export const requestCommissionProofUploadSchema = z.object({
  commissionId: z.string().cuid(),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(120),
  fileSize: z.number().int().positive(),
});

export const confirmCommissionPaidSchema = z.object({
  commissionId: z.string().cuid(),
  resolutionNote: z.string().trim().min(3).max(2000).optional(),
});

export const updateAgentCommissionSchema = z.object({
  commissionId: z.string().cuid(),
  label: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  amount: moneyAmountSchema,
  trackingId: z.string().trim().min(8).max(40).optional(),
});

export const cancelAgentCommissionSchema = z.object({
  commissionId: z.string().cuid(),
});

export const abortCommissionProofUploadSchema = z.object({
  commissionId: z.string().cuid(),
});

export const promoteUserToAgentSchema = z.object({
  userId: z.string().cuid(),
  notes: z.string().trim().max(2000).optional(),
});

// Backward-compatible alias
export const updateAgentCommissionRateSchema = updateAgentCommissionConfigSchema;
