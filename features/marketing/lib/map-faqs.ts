import { sanitizeFaqAnswer } from "@/lib/security/sanitize-content";

export type LocalizedFaqRecord = {
  id: string;
  questionEn: string;
  answerEn: string;
};

export function mapFaqsForLocale(faqs: LocalizedFaqRecord[], _locale?: string) {
  return faqs.map((faq) => {
    const question = faq.questionEn ?? "";
    const answer = sanitizeFaqAnswer(faq.answerEn ?? "");

    return {
      id: faq.id,
      question,
      answer,
    };
  });
}
