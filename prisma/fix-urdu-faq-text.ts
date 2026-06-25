import { PrismaClient } from "@prisma/client";

import { localizeFaqFieldsForUrdu } from "../lib/i18n/localize-brand-text";

export async function fixUrduFaqText(prisma: PrismaClient) {
  const faqs = await prisma.fAQ.findMany({
    select: {
      id: true,
      questionUr: true,
      answerUr: true,
    },
  });

  let updated = 0;

  for (const faq of faqs) {
    const localized = localizeFaqFieldsForUrdu(faq);

    if (
      localized.questionUr === faq.questionUr &&
      localized.answerUr === faq.answerUr
    ) {
      continue;
    }

    await prisma.fAQ.update({
      where: { id: faq.id },
      data: {
        questionUr: localized.questionUr,
        answerUr: localized.answerUr,
      },
    });
    updated += 1;
  }

  return updated;
}

const prisma = new PrismaClient();

fixUrduFaqText(prisma)
  .then((count) => {
    console.log(`Updated Urdu text in ${count} FAQ record(s).`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
