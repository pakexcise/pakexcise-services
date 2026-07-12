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
      const answerEn = String(record.answerEn ?? "").trim();

      if (!questionEn || !answerEn) {
        return null;
      }

      return {
        questionEn,
        answerEn,
      };
    })
    .filter((item): item is BlogContentFaq => item !== null);
}

export function mapBlogContentFaqsForLocale(
  faqs: BlogContentFaq[],
  locale: string,
): Array<{ question: string; answer: string }> {
  return faqs.map((faq) => ({
    question: faq.questionEn,
    answer: faq.answerEn,
  }));
}

export function mergeBlogFaqItems(
  contentFaqs: Array<{ question: string; answer: string }>,
  attachedFaqs: Array<{ question: string; answer: string }>,
): Array<{ question: string; answer: string }> {
  const seen = new Set<string>();
  const merged: Array<{ question: string; answer: string }> = [];

  for (const faq of [...contentFaqs, ...attachedFaqs]) {
    const key = faq.question.trim().toLowerCase();
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(faq);
  }

  return merged;
}
