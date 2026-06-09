import { sanitizeRichTextContent } from "@/lib/security/rich-text";

export function normalizeLocalizedContent(input: {
  titleEn: string;
  titleUr: string;
  excerptEn?: string | null;
  excerptUr?: string | null;
  contentEn: string;
  contentUr: string;
}) {
  return {
    titleEn: input.titleEn.trim(),
    titleUr: input.titleUr.trim(),
    excerptEn: input.excerptEn?.trim() || undefined,
    excerptUr: input.excerptUr?.trim() || undefined,
    contentEn: sanitizeRichTextContent(input.contentEn),
    contentUr: sanitizeRichTextContent(input.contentUr),
  };
}
