import type { PrismaClient } from "@prisma/client";

import {
  DEPRECATED_FAQ_CATEGORY_SLUGS,
  FAQ_CATEGORY_SEEDS,
  FAQ_ITEM_SEEDS,
} from "./seed-data/faqs";

export async function seedFaqs(prisma: PrismaClient) {
  console.log("Seeding FAQ categories and content...");

  const categoryMap: Record<string, string> = {};

  for (const category of FAQ_CATEGORY_SEEDS) {
    const record = await prisma.faqCategory.upsert({
      where: { slug: category.slug },
      create: {
        ...category,
        isActive: true,
      },
      update: {
        nameEn: category.nameEn,
        nameUr: category.nameUr,
        displayOrder: category.displayOrder,
        isActive: true,
      },
    });
    categoryMap[category.slug] = record.id;
  }

  if (DEPRECATED_FAQ_CATEGORY_SLUGS.length > 0) {
    await prisma.faqCategory.updateMany({
      where: { slug: { in: [...DEPRECATED_FAQ_CATEGORY_SLUGS] } },
      data: { isActive: false },
    });
  }

  const deleted = await prisma.fAQ.deleteMany({
    where: { serviceId: null },
  });
  console.log(`Removed ${deleted.count} existing global FAQ(s).`);

  for (const faq of FAQ_ITEM_SEEDS) {
    const categoryId = categoryMap[faq.categorySlug];

    if (!categoryId) {
      throw new Error(`Missing FAQ category for slug "${faq.categorySlug}"`);
    }

    await prisma.fAQ.create({
      data: {
        categoryId,
        serviceId: null,
        questionEn: faq.questionEn,
        questionUr: faq.questionUr,
        answerEn: faq.answerEn,
        answerUr: faq.answerUr,
        displayOrder: faq.displayOrder,
        isActive: true,
        isFeatured: faq.isFeatured ?? false,
        featuredDisplayOrder: faq.featuredDisplayOrder ?? 0,
      },
    });
  }

  console.log(`Seeded ${FAQ_ITEM_SEEDS.length} global FAQs.`);
}
