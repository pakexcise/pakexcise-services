import { z } from "zod";

export const submitCustomerReviewSchema = z.object({
  applicationId: z.string().cuid().optional(),
  serviceId: z.string().cuid(),
  authorNameEn: z.string().trim().min(2).max(100),
  contentEn: z.string().trim().min(20).max(1200),
  rating: z.coerce
    .number()
    .int("Choose a whole-star rating from 1 to 5.")
    .min(1)
    .max(5),
  turnstileToken: z.string().min(1).max(2048),
  website: z.string().max(0),
  formStartedAt: z.coerce.number().int().positive(),
  customerConsent: z.literal(true, {
    errorMap: () => ({
      message: "Consent is required before publishing your feedback.",
    }),
  }),
});
