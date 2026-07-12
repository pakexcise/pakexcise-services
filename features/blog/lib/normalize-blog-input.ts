import { DEFAULT_BLOG_AUTHOR } from "@/features/blog/lib/blog-authors";
import { resolveBlogImageSrc } from "@/features/blog/lib/blog-image-paths";
import { computeReadingTimeMinutes } from "@/features/blog/lib/reading-time";
import { parseBlogContentFaqs } from "@/features/blog/lib/content-faqs";
import type { BlogContentFaq } from "@/features/blog/types";
import { sanitizeRichTextContent } from "@/lib/security/rich-text";

function trimOptional(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function normalizeContentFaqs(faqs: BlogContentFaq[]): BlogContentFaq[] {
  return faqs.map((faq) => ({
    ...faq,
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
  excerptEn?: string | null;
  contentEn: string;
  categoryEn?: string | null;
  tags?: string[];
  authorNameEn?: string | null;
  readingTimeMinutes?: number | null;
  featuredImagePath?: string | null;
  featuredImageTitleEn?: string | null;
  featuredImageAltEn?: string | null;
  featuredImageCaptionEn?: string | null;
  focusKeywords?: string | null;
  isFeatured?: boolean;
  showTableOfContents?: boolean;
  contentFaqs?: unknown;
  ctaTitleEn?: string | null;
  ctaDescriptionEn?: string | null;
  ctaWhatsappLabelEn?: string | null;
  ctaRequestLabelEn?: string | null;
  ctaAccountLabelEn?: string | null;
}) {
  const contentEn = sanitizeRichTextContent(input.contentEn);
  const readingTimeMinutes = computeReadingTimeMinutes(contentEn);
  const parsedFaqs = normalizeContentFaqs(parseBlogContentFaqs(input.contentFaqs));

  return {
    titleEn: input.titleEn.trim(),
    excerptEn: trimOptional(input.excerptEn),
    contentEn,
    categoryEn: trimOptional(input.categoryEn),
    tags: normalizeTags(input.tags),
    authorNameEn: trimOptional(input.authorNameEn) ?? DEFAULT_BLOG_AUTHOR.en,
    readingTimeMinutes,
    featuredImagePath: trimOptional(resolveBlogImageSrc(input.featuredImagePath) ?? input.featuredImagePath),
    featuredImageTitleEn: trimOptional(input.featuredImageTitleEn),
    featuredImageAltEn: trimOptional(input.featuredImageAltEn),
    featuredImageCaptionEn: trimOptional(input.featuredImageCaptionEn),
    focusKeywords: trimOptional(input.focusKeywords),
    isFeatured: input.isFeatured ?? false,
    showTableOfContents: input.showTableOfContents ?? true,
    contentFaqs: parsedFaqs,
    ctaTitleEn: trimOptional(input.ctaTitleEn),
    ctaDescriptionEn: trimOptional(input.ctaDescriptionEn),
    ctaWhatsappLabelEn: trimOptional(input.ctaWhatsappLabelEn),
    ctaRequestLabelEn: trimOptional(input.ctaRequestLabelEn),
    ctaAccountLabelEn: trimOptional(input.ctaAccountLabelEn),
  };
}
