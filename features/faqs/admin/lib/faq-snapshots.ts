import type { AdminFaqDetail } from "@/server/repositories/admin-faq-repository";

export function faqAuditSnapshot(faq: AdminFaqDetail | null) {
  if (!faq) {
    return null;
  }

  return {
    id: faq.id,
    categoryId: faq.categoryId,
    categorySlug: faq.faqCategory?.slug,
    questionEn: faq.questionEn,
    questionUr: faq.questionUr,
    answerEn: faq.answerEn.slice(0, 200),
    answerUr: faq.answerUr.slice(0, 200),
    serviceId: faq.serviceId,
    isActive: faq.isActive,
    isFeatured: faq.isFeatured,
    displayOrder: faq.displayOrder,
    featuredDisplayOrder: faq.featuredDisplayOrder,
  };
}
