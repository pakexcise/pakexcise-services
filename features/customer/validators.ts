import { z } from "zod";

import { trackingIdSchema } from "@/lib/validations/common";

export const trackApplicationSchema = z.object({
  trackingId: trackingIdSchema,
});

export const updateCustomerProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .min(1)
    .max(20)
    .regex(/^(\+92|0)?3\d{9}$/, "Invalid Pakistani mobile number"),
});
