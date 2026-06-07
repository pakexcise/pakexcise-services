import { pickLocalized } from "@/lib/i18n/content";
import { sanitizeFaqAnswer } from "@/lib/security/sanitize-content";

export type LocalizedFaqRecord = {
  id: string;
  questionEn: string;
  questionUr: string;
  answerEn: string;
  answerUr: string;
};

export function mapFaqsForLocale(
  faqs: LocalizedFaqRecord[],
  locale: string,
) {
  return faqs.map((faq) => ({
    id: faq.id,
    question: pickLocalized(locale, {
      en: faq.questionEn,
      ur: faq.questionUr,
    }),
    answer: sanitizeFaqAnswer(
      pickLocalized(locale, {
        en: faq.answerEn,
        ur: faq.answerUr,
      }),
    ),
  }));
}
