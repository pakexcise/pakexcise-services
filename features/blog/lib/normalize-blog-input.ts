import { DEFAULT_BLOG_AUTHOR } from "@/features/blog/lib/blog-authors";
import { normalizeUrduBrandText } from "@/features/blog/lib/blog-brand";
import { computeReadingTimeMinutes } from "@/features/blog/lib/reading-time";
import { parseBlogContentFaqs } from "@/features/blog/lib/content-faqs";
import type { BlogContentFaq } from "@/features/blog/types";
import { sanitizeRichTextContent } from "@/lib/security/rich-text";

function trimOptional(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function normalizeUrduOptional(value: string | null | undefined): string | undefined {
  const trimmed = trimOptional(value);
  return trimmed ? normalizeUrduBrandText(trimmed) : undefined;
}

function normalizeContentFaqs(faqs: BlogContentFaq[]): BlogContentFaq[] {
  return faqs.map((faq) => ({
    ...faq,
    questionUr: normalizeUrduBrandText(faq.questionUr || faq.questionEn),
    answerUr: normalizeUrduBrandText(faq.answerUr || faq.answerEn),
  }));
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
  const contentUr = normalizeUrduBrandText(sanitizeRichTextContent(input.contentUr));
  const readingTimeMinutes = computeReadingTimeMinutes(contentEn);
  const parsedFaqs = normalizeContentFaqs(parseBlogContentFaqs(input.contentFaqs));

  return {
    titleEn: input.titleEn.trim(),
    titleUr: normalizeUrduBrandText(input.titleUr.trim()),
    excerptEn: trimOptional(input.excerptEn),
    excerptUr: normalizeUrduOptional(input.excerptUr),
    contentEn,
    contentUr,
    categoryEn: trimOptional(input.categoryEn),
    categoryUr: normalizeUrduOptional(input.categoryUr),
    tags: normalizeTags(input.tags),
    authorNameEn: trimOptional(input.authorNameEn) ?? DEFAULT_BLOG_AUTHOR.en,
    authorNameUr: normalizeUrduOptional(input.authorNameUr) ?? DEFAULT_BLOG_AUTHOR.ur,
    readingTimeMinutes,
    featuredImagePath: trimOptional(input.featuredImagePath),
    featuredImageTitleEn: trimOptional(input.featuredImageTitleEn),
    featuredImageTitleUr: normalizeUrduOptional(input.featuredImageTitleUr),
    featuredImageAltEn: trimOptional(input.featuredImageAltEn),
    featuredImageAltUr: normalizeUrduOptional(input.featuredImageAltUr),
    featuredImageCaptionEn: trimOptional(input.featuredImageCaptionEn),
    featuredImageCaptionUr: normalizeUrduOptional(input.featuredImageCaptionUr),
    focusKeywords: trimOptional(input.focusKeywords),
    isFeatured: input.isFeatured ?? false,
    showTableOfContents: input.showTableOfContents ?? true,
    contentFaqs: parsedFaqs,
    ctaTitleEn: trimOptional(input.ctaTitleEn),
    ctaTitleUr: normalizeUrduOptional(input.ctaTitleUr),
    ctaDescriptionEn: trimOptional(input.ctaDescriptionEn),
    ctaDescriptionUr: normalizeUrduOptional(input.ctaDescriptionUr),
    ctaWhatsappLabelEn: trimOptional(input.ctaWhatsappLabelEn),
    ctaWhatsappLabelUr: normalizeUrduOptional(input.ctaWhatsappLabelUr),
    ctaRequestLabelEn: trimOptional(input.ctaRequestLabelEn),
    ctaRequestLabelUr: normalizeUrduOptional(input.ctaRequestLabelUr),
    ctaAccountLabelEn: trimOptional(input.ctaAccountLabelEn),
    ctaAccountLabelUr: normalizeUrduOptional(input.ctaAccountLabelUr),
  };
}
