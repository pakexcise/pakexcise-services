import type { BlogContentFaq } from "@/features/blog/types";
import { PRIMARY_BLOG_CONTENT_FAQS } from "@/prisma/primary-blog-seed";

export const DEFAULT_BLOG_CTA = {
  ctaTitleEn: "Need Help with Vehicle or License Services?",
  ctaDescriptionEn:
    "PakExcise helps you submit service requests, get WhatsApp support, and track your application through a simple digital process.",
  ctaWhatsappLabelEn: "Contact on WhatsApp",
  ctaRequestLabelEn: "Submit Request",
  ctaAccountLabelEn: "Apply with Account",
} as const;

export const DEFAULT_BLOG_CONTENT_FAQS: BlogContentFaq[] = PRIMARY_BLOG_CONTENT_FAQS.map(
  (faq) => ({ ...faq }),
);

export function hasBlogCtaContent(input: {
  ctaTitleEn?: string | null;
  ctaDescriptionEn?: string | null;
}): boolean {
  return Boolean(input.ctaTitleEn?.trim() || input.ctaDescriptionEn?.trim());
}

export function resolveBlogCtaFields<
  T extends {
    ctaTitleEn?: string | null;
    ctaDescriptionEn?: string | null;
    ctaWhatsappLabelEn?: string | null;
    ctaRequestLabelEn?: string | null;
    ctaAccountLabelEn?: string | null;
  },
>(post: T): T & {
  ctaTitleEn: string;
  ctaDescriptionEn: string;
  ctaWhatsappLabelEn: string;
  ctaRequestLabelEn: string;
  ctaAccountLabelEn: string;
} {
  if (hasBlogCtaContent(post)) {
    return {
      ...post,
      ctaTitleEn: post.ctaTitleEn ?? DEFAULT_BLOG_CTA.ctaTitleEn,
      ctaDescriptionEn: post.ctaDescriptionEn ?? DEFAULT_BLOG_CTA.ctaDescriptionEn,
      ctaWhatsappLabelEn: post.ctaWhatsappLabelEn ?? DEFAULT_BLOG_CTA.ctaWhatsappLabelEn,
      ctaRequestLabelEn: post.ctaRequestLabelEn ?? DEFAULT_BLOG_CTA.ctaRequestLabelEn,
      ctaAccountLabelEn: post.ctaAccountLabelEn ?? DEFAULT_BLOG_CTA.ctaAccountLabelEn,
    };
  }

  return { ...post, ...DEFAULT_BLOG_CTA };
}

export function resolveBlogContentFaqs(faqs: BlogContentFaq[]): BlogContentFaq[] {
  return faqs.length > 0 ? faqs : DEFAULT_BLOG_CONTENT_FAQS;
}
