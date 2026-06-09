import { z } from "zod";

import { cnicSchema, phoneSchema } from "@/lib/validations/common";

export const basicApplicantDetailsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name is required")
    .max(120, "Full name is too long"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: phoneSchema,
  cnic: cnicSchema,
});

export type BasicApplicantDetailsInput = z.infer<
  typeof basicApplicantDetailsSchema
>;
