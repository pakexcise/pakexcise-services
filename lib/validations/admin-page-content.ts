import { z } from "zod";

import { seoMetaInputSchema } from "@/lib/validations/admin-seo";

export const legalPageKeys = [
  "privacy",
  "terms",
  "disclaimer",
  "refund",
] as const;

export type LegalPageKey = (typeof legalPageKeys)[number];

export const pageContentSchema = z.object({
  pageKey: z.enum(legalPageKeys),
  titleEn: z.string().trim().min(2).max(200),
  titleUr: z.string().trim().min(2).max(200),
  excerptEn: z.string().trim().max(5000).optional().nullable(),
  excerptUr: z.string().trim().max(5000).optional().nullable(),
  contentEn: z.string().trim().min(1).max(100000),
  contentUr: z.string().trim().min(1).max(100000),
  seo: seoMetaInputSchema.optional(),
});
