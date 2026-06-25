import type { PrismaClient } from "@prisma/client";

import { SERVICE_FAQ_SEEDS } from "./seed-data/service-faqs";

export async function seedServiceFaqs(prisma: PrismaClient) {
  console.log("Seeding service-specific FAQs...");

  const [services, categories, regions] = await Promise.all([
    prisma.service.findMany({
      where: { deletedAt: null },
      select: { id: true, slug: true },
    }),
    prisma.faqCategory.findMany({
      select: { id: true, slug: true },
    }),
    prisma.region.findMany({
      where: { deletedAt: null },
      select: { id: true, slug: true },
    }),
  ]);

  const serviceMap = Object.fromEntries(services.map((item) => [item.slug, item.id]));
  const categoryMap = Object.fromEntries(categories.map((item) => [item.slug, item.id]));
  const regionMap = Object.fromEntries(regions.map((item) => [item.slug, item.id]));

  const serviceSlugs = [...new Set(SERVICE_FAQ_SEEDS.map((item) => item.serviceSlug))];

  const deleted = await prisma.fAQ.deleteMany({
    where: {
      serviceId: {
        in: serviceSlugs
          .map((slug) => serviceMap[slug])
          .filter((id): id is string => Boolean(id)),
      },
    },
  });
  console.log(`Removed ${deleted.count} existing service FAQ(s).`);

  let created = 0;

  for (const faq of SERVICE_FAQ_SEEDS) {
    const serviceId = serviceMap[faq.serviceSlug];
    const categoryId = categoryMap[faq.categorySlug];

    if (!serviceId) {
      throw new Error(`Missing service for slug "${faq.serviceSlug}"`);
    }

    if (!categoryId) {
      throw new Error(`Missing FAQ category for slug "${faq.categorySlug}"`);
    }

    const regionId = faq.regionSlug ? regionMap[faq.regionSlug] : undefined;

    if (faq.regionSlug && !regionId) {
      throw new Error(`Missing region for slug "${faq.regionSlug}"`);
    }

    await prisma.fAQ.create({
      data: {
        serviceId,
        categoryId,
        regionId: regionId ?? null,
        questionEn: faq.questionEn,
        questionUr: faq.questionUr,
        answerEn: faq.answerEn,
        answerUr: faq.answerUr,
        seoKeywordsEn: faq.seoKeywordsEn ?? null,
        seoKeywordsUr: faq.seoKeywordsUr ?? null,
        displayOrder: faq.displayOrder,
        isActive: true,
        isFeatured: false,
        featuredDisplayOrder: 0,
      },
    });
    created += 1;
  }

  console.log(`Seeded ${created} service-specific FAQs.`);
}
