import { DEFAULT_BLOG_AUTHOR } from "@/features/blog/lib/blog-authors";
import {
  DEFAULT_BLOG_CONTENT_FAQS,
  DEFAULT_BLOG_CTA,
} from "@/features/blog/lib/blog-defaults";
import type { BlogEditorValues } from "@/features/blog/admin/components/blog-editor-form";

export function mergeBlogEditorDefaults(values: BlogEditorValues): BlogEditorValues {
  return {
    ...values,
    contentFaqs:
      values.contentFaqs.length > 0
        ? values.contentFaqs
        : DEFAULT_BLOG_CONTENT_FAQS.map((faq) => ({ ...faq })),
    ctaTitleEn: values.ctaTitleEn || DEFAULT_BLOG_CTA.ctaTitleEn,
    ctaTitleUr: values.ctaTitleUr || DEFAULT_BLOG_CTA.ctaTitleUr,
    ctaDescriptionEn: values.ctaDescriptionEn || DEFAULT_BLOG_CTA.ctaDescriptionEn,
    ctaDescriptionUr: values.ctaDescriptionUr || DEFAULT_BLOG_CTA.ctaDescriptionUr,
    ctaWhatsappLabelEn:
      values.ctaWhatsappLabelEn || DEFAULT_BLOG_CTA.ctaWhatsappLabelEn,
    ctaWhatsappLabelUr:
      values.ctaWhatsappLabelUr || DEFAULT_BLOG_CTA.ctaWhatsappLabelUr,
    ctaRequestLabelEn: values.ctaRequestLabelEn || DEFAULT_BLOG_CTA.ctaRequestLabelEn,
    ctaRequestLabelUr: values.ctaRequestLabelUr || DEFAULT_BLOG_CTA.ctaRequestLabelUr,
    ctaAccountLabelEn: values.ctaAccountLabelEn || DEFAULT_BLOG_CTA.ctaAccountLabelEn,
    ctaAccountLabelUr: values.ctaAccountLabelUr || DEFAULT_BLOG_CTA.ctaAccountLabelUr,
    authorNameEn: values.authorNameEn || DEFAULT_BLOG_AUTHOR.en,
    authorNameUr: values.authorNameUr || DEFAULT_BLOG_AUTHOR.ur,
  };
}

export function createEmptyBlogValues(): BlogEditorValues {
  return mergeBlogEditorDefaults({
    slug: "",
    titleEn: "",
    titleUr: "",
    excerptEn: "",
    excerptUr: "",
    contentEn: "",
    contentUr: "",
    categoryEn: "",
    categoryUr: "",
    categoryId: "",
    subCategoryId: "",
    tags: [],
    authorNameEn: DEFAULT_BLOG_AUTHOR.en,
    authorNameUr: DEFAULT_BLOG_AUTHOR.ur,
    readingTimeMinutes: "",
    featuredImagePath: "",
    featuredImageTitleEn: "",
    featuredImageTitleUr: "",
    featuredImageAltEn: "",
    featuredImageAltUr: "",
    featuredImageCaptionEn: "",
    featuredImageCaptionUr: "",
    focusKeywords: "",
    isFeatured: false,
    showTableOfContents: true,
    contentFaqs: [],
    ctaTitleEn: "",
    ctaTitleUr: "",
    ctaDescriptionEn: "",
    ctaDescriptionUr: "",
    ctaWhatsappLabelEn: "",
    ctaWhatsappLabelUr: "",
    ctaRequestLabelEn: "",
    ctaRequestLabelUr: "",
    ctaAccountLabelEn: "",
    ctaAccountLabelUr: "",
    relatedServiceIds: [],
    attachedFaqIds: [],
    isPublished: false,
    seo: {
      metaTitleEn: "",
      metaTitleUr: "",
      metaDescriptionEn: "",
      metaDescriptionUr: "",
      h1En: "",
      h1Ur: "",
      canonicalUrl: "",
      ogTitleEn: "",
      ogTitleUr: "",
      ogDescriptionEn: "",
      ogDescriptionUr: "",
      ogImage: "",
      twitterCard: "summary_large_image",
      robotsIndex: true,
      robotsFollow: true,
      faqSchemaJson: null,
      breadcrumbJson: null,
    },
  });
}
