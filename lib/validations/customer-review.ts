import { z } from "zod";

export const submitCustomerReviewSchema = z.object({
  applicationId: z.string().cuid(),
  authorNameEn: z.string().trim().min(2).max(100),
  contentEn: z.string().trim().min(20).max(1200),
  rating: z.coerce.number().int().min(1).max(5),
  customerConsent: z.literal(true, {
    errorMap: () => ({
      message: "Consent is required before publishing your feedback.",
    }),
  }),
});
