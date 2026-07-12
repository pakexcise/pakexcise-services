import "server-only";

import { prisma } from "@/server/db/client";

export async function loadRelatedServices(serviceIds: string[]) {
  if (serviceIds.length === 0) {
    return [];
  }

  return prisma.service.findMany({
    where: {
      id: { in: serviceIds },
      isActive: true,
      deletedAt: null,
    },
    select: {
      id: true,
      slug: true,
      nameEn: true,
      shortDescriptionEn: true,
      region: {
        select: { nameEn: true },
      },
    },
    orderBy: { displayOrder: "asc" },
  });
}

export async function loadAttachedFaqs(faqIds: string[]) {
  if (faqIds.length === 0) {
    return [];
  }

  const faqs = await prisma.fAQ.findMany({
    where: {
      id: { in: faqIds },
      isActive: true,
    },
    select: {
      id: true,
      questionEn: true,
      answerEn: true,
    },
  });

  const faqById = new Map(faqs.map((faq) => [faq.id, faq]));

  return faqIds
    .map((id) => faqById.get(id))
    .filter((faq): faq is NonNullable<typeof faq> => faq !== undefined);
}
