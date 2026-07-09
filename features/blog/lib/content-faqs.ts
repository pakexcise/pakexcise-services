import type { BlogContentFaq } from "@/features/blog/types";

export function parseBlogContentFaqs(value: unknown): BlogContentFaq[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const questionEn = String(record.questionEn ?? "").trim();
      const questionUr = String(record.questionUr ?? "").trim();
      const answerEn = String(record.answerEn ?? "").trim();
      const answerUr = String(record.answerUr ?? "").trim();

      if (!questionEn || !answerEn) {
        return null;
      }

      return {
        questionEn,
        questionUr: questionUr || questionEn,
        answerEn,
        answerUr: answerUr || answerEn,
      };
    })
    .filter((item): item is BlogContentFaq => item !== null);
}

export function mapBlogContentFaqsForLocale(
  faqs: BlogContentFaq[],
  locale: string,
): Array<{ question: string; answer: string }> {
  return faqs.map((faq) => ({
    question: locale === "ur" ? faq.questionUr : faq.questionEn,
    answer: locale === "ur" ? faq.answerUr : faq.answerEn,
  }));
}
