import type { BlogContentFaq } from "@/features/blog/types";
import { PRIMARY_BLOG_CONTENT_FAQS } from "@/prisma/primary-blog-seed";

export const DEFAULT_BLOG_CTA = {
  ctaTitleEn: "Need Help with Vehicle or License Services?",
  ctaTitleUr: "گاڑی یا لائسنس خدمات میں مدد چاہیے؟",
  ctaDescriptionEn:
    "PakExcise helps you submit service requests, get WhatsApp support, and track your application through a simple digital process.",
  ctaDescriptionUr:
    "پاک ایکسائز آپ کو سروس درخواستیں جمع کرانے، واٹس ایپ سپورٹ حاصل کرنے اور آسان ڈیجیٹل عمل کے ذریعے اپنی درخواست ٹریک کرنے میں مدد کرتا ہے۔",
  ctaWhatsappLabelEn: "Contact on WhatsApp",
  ctaWhatsappLabelUr: "واٹس ایپ پر رابطہ کریں",
  ctaRequestLabelEn: "Submit Request",
  ctaRequestLabelUr: "درخواست جمع کریں",
  ctaAccountLabelEn: "Apply with Account",
  ctaAccountLabelUr: "اکاؤنٹ کے ساتھ درخواست دیں",
} as const;

export const DEFAULT_BLOG_CONTENT_FAQS: BlogContentFaq[] = PRIMARY_BLOG_CONTENT_FAQS.map(
  (faq) => ({ ...faq }),
);

export function hasBlogCtaContent(input: {
  ctaTitleEn?: string | null;
  ctaTitleUr?: string | null;
  ctaDescriptionEn?: string | null;
  ctaDescriptionUr?: string | null;
}): boolean {
  return Boolean(
    input.ctaTitleEn?.trim() ||
      input.ctaTitleUr?.trim() ||
      input.ctaDescriptionEn?.trim() ||
      input.ctaDescriptionUr?.trim(),
  );
}

export function resolveBlogCtaFields<
  T extends {
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
  },
>(post: T): T & {
  ctaTitleEn: string;
  ctaTitleUr: string;
  ctaDescriptionEn: string;
  ctaDescriptionUr: string;
  ctaWhatsappLabelEn: string;
  ctaWhatsappLabelUr: string;
  ctaRequestLabelEn: string;
  ctaRequestLabelUr: string;
  ctaAccountLabelEn: string;
  ctaAccountLabelUr: string;
} {
  if (hasBlogCtaContent(post)) {
    return {
      ...post,
      ctaTitleEn: post.ctaTitleEn ?? DEFAULT_BLOG_CTA.ctaTitleEn,
      ctaTitleUr: post.ctaTitleUr ?? DEFAULT_BLOG_CTA.ctaTitleUr,
      ctaDescriptionEn: post.ctaDescriptionEn ?? DEFAULT_BLOG_CTA.ctaDescriptionEn,
      ctaDescriptionUr: post.ctaDescriptionUr ?? DEFAULT_BLOG_CTA.ctaDescriptionUr,
      ctaWhatsappLabelEn: post.ctaWhatsappLabelEn ?? DEFAULT_BLOG_CTA.ctaWhatsappLabelEn,
      ctaWhatsappLabelUr: post.ctaWhatsappLabelUr ?? DEFAULT_BLOG_CTA.ctaWhatsappLabelUr,
      ctaRequestLabelEn: post.ctaRequestLabelEn ?? DEFAULT_BLOG_CTA.ctaRequestLabelEn,
      ctaRequestLabelUr: post.ctaRequestLabelUr ?? DEFAULT_BLOG_CTA.ctaRequestLabelUr,
      ctaAccountLabelEn: post.ctaAccountLabelEn ?? DEFAULT_BLOG_CTA.ctaAccountLabelEn,
      ctaAccountLabelUr: post.ctaAccountLabelUr ?? DEFAULT_BLOG_CTA.ctaAccountLabelUr,
    };
  }

  return { ...post, ...DEFAULT_BLOG_CTA };
}

export function resolveBlogContentFaqs(faqs: BlogContentFaq[]): BlogContentFaq[] {
  return faqs.length > 0 ? faqs : DEFAULT_BLOG_CONTENT_FAQS;
}
