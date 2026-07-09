import { computeReadingTimeMinutes } from "@/features/blog/lib/reading-time";
import { parseBlogContentFaqs } from "@/features/blog/lib/content-faqs";
import { sanitizeRichTextContent } from "@/lib/security/rich-text";

function trimOptional(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function normalizeTags(tags: string[] | undefined): string[] {
  if (!tags?.length) {
    return [];
  }

  const seen = new Set<string>();
  return tags
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => {
      if (!tag || seen.has(tag)) {
        return false;
      }
      seen.add(tag);
      return true;
    })
    .slice(0, 20);
}

export function normalizeBlogPostInput(input: {
  titleEn: string;
  titleUr: string;
  excerptEn?: string | null;
  excerptUr?: string | null;
  contentEn: string;
  contentUr: string;
  categoryEn?: string | null;
  categoryUr?: string | null;
  tags?: string[];
  authorNameEn?: string | null;
  authorNameUr?: string | null;
  readingTimeMinutes?: number | null;
  featuredImagePath?: string | null;
  featuredImageTitleEn?: string | null;
  featuredImageTitleUr?: string | null;
  featuredImageAltEn?: string | null;
  featuredImageAltUr?: string | null;
  featuredImageCaptionEn?: string | null;
  featuredImageCaptionUr?: string | null;
  focusKeywords?: string | null;
  isFeatured?: boolean;
  showTableOfContents?: boolean;
  contentFaqs?: unknown;
  ctaTitleEn?: string | null;
  ctaTitleUr?: string | null;
  ctaDescriptionEn?: string | null;
  ctaDescriptionUr?: string | null;
  ctaWhatsappLabelEn?: string | null;
  ctaWhatsappLabelUr?: string | null;
  ctaRequestLabelEn?: string | null;
  ctaRequestLabelUr?: string | null;
  ctaAccountLabelEn?: string | null;
  ctaAccountLabelUr?: string | null;
}) {
  const contentEn = sanitizeRichTextContent(input.contentEn);
  const contentUr = sanitizeRichTextContent(input.contentUr);
  const readingTimeMinutes =
    input.readingTimeMinutes && input.readingTimeMinutes > 0
      ? input.readingTimeMinutes
      : computeReadingTimeMinutes(contentEn);

  return {
    titleEn: input.titleEn.trim(),
    titleUr: input.titleUr.trim(),
    excerptEn: trimOptional(input.excerptEn),
    excerptUr: trimOptional(input.excerptUr),
    contentEn,
    contentUr,
    categoryEn: trimOptional(input.categoryEn),
    categoryUr: trimOptional(input.categoryUr),
    tags: normalizeTags(input.tags),
    authorNameEn: trimOptional(input.authorNameEn),
    authorNameUr: trimOptional(input.authorNameUr),
    readingTimeMinutes,
    featuredImagePath: trimOptional(input.featuredImagePath),
    featuredImageTitleEn: trimOptional(input.featuredImageTitleEn),
    featuredImageTitleUr: trimOptional(input.featuredImageTitleUr),
    featuredImageAltEn: trimOptional(input.featuredImageAltEn),
    featuredImageAltUr: trimOptional(input.featuredImageAltUr),
    featuredImageCaptionEn: trimOptional(input.featuredImageCaptionEn),
    featuredImageCaptionUr: trimOptional(input.featuredImageCaptionUr),
    focusKeywords: trimOptional(input.focusKeywords),
    isFeatured: input.isFeatured ?? false,
    showTableOfContents: input.showTableOfContents ?? true,
    contentFaqs: parseBlogContentFaqs(input.contentFaqs),
    ctaTitleEn: trimOptional(input.ctaTitleEn),
    ctaTitleUr: trimOptional(input.ctaTitleUr),
    ctaDescriptionEn: trimOptional(input.ctaDescriptionEn),
    ctaDescriptionUr: trimOptional(input.ctaDescriptionUr),
    ctaWhatsappLabelEn: trimOptional(input.ctaWhatsappLabelEn),
    ctaWhatsappLabelUr: trimOptional(input.ctaWhatsappLabelUr),
    ctaRequestLabelEn: trimOptional(input.ctaRequestLabelEn),
    ctaRequestLabelUr: trimOptional(input.ctaRequestLabelUr),
    ctaAccountLabelEn: trimOptional(input.ctaAccountLabelEn),
    ctaAccountLabelUr: trimOptional(input.ctaAccountLabelUr),
  };
}
