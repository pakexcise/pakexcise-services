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
    ctaDescriptionEn: values.ctaDescriptionEn || DEFAULT_BLOG_CTA.ctaDescriptionEn,
    ctaWhatsappLabelEn:
      values.ctaWhatsappLabelEn || DEFAULT_BLOG_CTA.ctaWhatsappLabelEn,
    ctaRequestLabelEn: values.ctaRequestLabelEn || DEFAULT_BLOG_CTA.ctaRequestLabelEn,
    ctaAccountLabelEn: values.ctaAccountLabelEn || DEFAULT_BLOG_CTA.ctaAccountLabelEn,
    authorNameEn: values.authorNameEn || DEFAULT_BLOG_AUTHOR.en,
  };
}

export function createEmptyBlogValues(): BlogEditorValues {
  return mergeBlogEditorDefaults({
    slug: "",
    titleEn: "",
    excerptEn: "",
    contentEn: "",
    categoryEn: "",
    categoryId: "",
    subCategoryId: "",
    tags: [],
    authorNameEn: DEFAULT_BLOG_AUTHOR.en,
    readingTimeMinutes: "",
    featuredImagePath: "",
    featuredImageTitleEn: "",
    featuredImageAltEn: "",
    featuredImageCaptionEn: "",
    focusKeywords: "",
    isFeatured: false,
    showTableOfContents: true,
    contentFaqs: [],
    ctaTitleEn: "",
    ctaDescriptionEn: "",
    ctaWhatsappLabelEn: "",
    ctaRequestLabelEn: "",
    ctaAccountLabelEn: "",
    relatedServiceIds: [],
    attachedFaqIds: [],
    isPublished: false,
    seo: {
      metaTitleEn: "",
      metaDescriptionEn: "",
      h1En: "",
      canonicalUrl: "",
      ogTitleEn: "",
      ogDescriptionEn: "",
      ogImage: "",
      twitterCard: "summary_large_image",
      robotsIndex: true,
      robotsFollow: true,
      faqSchemaJson: null,
      breadcrumbJson: null,
    },
  });
}
