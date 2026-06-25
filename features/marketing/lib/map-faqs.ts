import { pickLocalized } from "@/lib/i18n/content";
import { localizeFaqTextForUrdu } from "@/lib/i18n/localize-brand-text";
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
  return faqs.map((faq) => {
    const question = pickLocalized(locale, {
      en: faq.questionEn,
      ur: faq.questionUr,
    });
    const answer = sanitizeFaqAnswer(
      pickLocalized(locale, {
        en: faq.answerEn,
        ur: faq.answerUr,
      }),
    );

    if (locale === "ur") {
      return {
        id: faq.id,
        question: localizeFaqTextForUrdu(question),
        answer: localizeFaqTextForUrdu(answer),
      };
    }

    return {
      id: faq.id,
      question,
      answer,
    };
  });
}
