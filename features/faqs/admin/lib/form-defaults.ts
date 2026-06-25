import type { AdminFaqDetail } from "@/server/repositories/admin-faq-repository";

export type FaqEditorValues = {
  questionEn: string;
  questionUr: string;
  answerEn: string;
  answerUr: string;
  categoryId: string;
  serviceId: string;
  regionId: string;
  seoKeywordsEn: string;
  seoKeywordsUr: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  featuredDisplayOrder: number;
};

export function emptyFaqEditorValues(
  displayOrder = 0,
  categoryId = "",
  serviceId = "",
): FaqEditorValues {
  return {
    questionEn: "",
    questionUr: "",
    answerEn: "",
    answerUr: "",
    categoryId,
    serviceId,
    regionId: "",
    seoKeywordsEn: "",
    seoKeywordsUr: "",
    isActive: true,
    isFeatured: false,
    displayOrder,
    featuredDisplayOrder: 0,
  };
}

export function faqDetailToEditorValues(faq: AdminFaqDetail): FaqEditorValues {
  return {
    questionEn: faq.questionEn,
    questionUr: faq.questionUr,
    answerEn: faq.answerEn,
    answerUr: faq.answerUr,
    categoryId: faq.categoryId,
    serviceId: faq.serviceId ?? "",
    regionId: faq.regionId ?? "",
    seoKeywordsEn: faq.seoKeywordsEn ?? "",
    seoKeywordsUr: faq.seoKeywordsUr ?? "",
    isActive: faq.isActive,
    isFeatured: faq.isFeatured,
    displayOrder: faq.displayOrder,
    featuredDisplayOrder: faq.featuredDisplayOrder,
  };
}
