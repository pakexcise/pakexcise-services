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
      nameUr: true,
      shortDescriptionEn: true,
      shortDescriptionUr: true,
      region: {
        select: { nameEn: true, nameUr: true },
      },
    },
    orderBy: { displayOrder: "asc" },
  });
}

export async function loadAttachedFaqs(faqIds: string[]) {
  if (faqIds.length === 0) {
    return [];
  }

  return prisma.fAQ.findMany({
    where: {
      id: { in: faqIds },
      isActive: true,
    },
    select: {
      id: true,
      questionEn: true,
      questionUr: true,
      answerEn: true,
      answerUr: true,
    },
    orderBy: { displayOrder: "asc" },
  });
}
