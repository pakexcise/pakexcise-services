import type { AdminFaqDetail } from "@/server/repositories/admin-faq-repository";

export type FaqEditorValues = {
  questionEn: string;
  answerEn: string;
  categoryId: string;
  serviceId: string;
  regionId: string;
  seoKeywordsEn: string;
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
    answerEn: "",
    categoryId,
    serviceId,
    regionId: "",
    seoKeywordsEn: "",
    isActive: true,
    isFeatured: false,
    displayOrder,
    featuredDisplayOrder: 0};
}

export function faqDetailToEditorValues(faq: AdminFaqDetail): FaqEditorValues {
  return {
    questionEn: faq.questionEn,
    answerEn: faq.answerEn,
    categoryId: faq.categoryId,
    serviceId: faq.serviceId ?? "",
    regionId: faq.regionId ?? "",
    seoKeywordsEn: faq.seoKeywordsEn ?? "",
    isActive: faq.isActive,
    isFeatured: faq.isFeatured,
    displayOrder: faq.displayOrder,
    featuredDisplayOrder: faq.featuredDisplayOrder};
}
