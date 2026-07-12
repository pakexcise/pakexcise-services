import { sanitizeRichTextContent } from "@/lib/security/rich-text";

export function normalizeLocalizedContent(input: {
  titleEn: string;
  excerptEn?: string | null;
  contentEn: string;
}) {
  return {
    titleEn: input.titleEn.trim(),
    excerptEn: input.excerptEn?.trim() || undefined,
    contentEn: sanitizeRichTextContent(input.contentEn)};
}
