import { z } from "zod";

export const submitCustomerReviewSchema = z.object({
  applicationId: z.string().cuid().optional(),
  serviceId: z.string().cuid(),
  authorNameEn: z.string().trim().min(2).max(100),
  contentEn: z.string().trim().min(20).max(1200),
  rating: z.coerce
    .number()
    .min(1, "Choose a rating from 1.0 to 5.0.")
    .max(5, "Choose a rating from 1.0 to 5.0.")
    .transform((value) => Math.round(value * 10) / 10),
  turnstileToken: z.string().min(1).max(2048),
  website: z.string().max(0),
  formStartedAt: z.coerce.number().int().positive(),
  customerConsent: z.literal(true, {
    errorMap: () => ({
      message: "Consent is required before publishing your feedback.",
    }),
  }),
});
