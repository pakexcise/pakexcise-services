import type { AdminFaqDetail } from "@/server/repositories/admin-faq-repository";

export type FaqEditorValues = {
  questionEn: string;
  questionUr: string;
  answerEn: string;
  answerUr: string;
  category: string;
  serviceId: string;
  isActive: boolean;
  displayOrder: number;
};

export function emptyFaqEditorValues(
  displayOrder = 0,
  serviceId = "",
): FaqEditorValues {
  return {
    questionEn: "",
    questionUr: "",
    answerEn: "",
    answerUr: "",
    category: "general",
    serviceId,
    isActive: true,
    displayOrder,
  };
}

export function faqDetailToEditorValues(faq: AdminFaqDetail): FaqEditorValues {
  return {
    questionEn: faq.questionEn,
    questionUr: faq.questionUr,
    answerEn: faq.answerEn,
    answerUr: faq.answerUr,
    category: faq.category,
    serviceId: faq.serviceId ?? "",
    isActive: faq.isActive,
    displayOrder: faq.displayOrder,
  };
}
