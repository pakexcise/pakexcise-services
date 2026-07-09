import "server-only";

import { prisma } from "@/server/db/client";

/** Drops stale service/FAQ IDs so blog/guide saves do not fail after re-seeds. */
export async function sanitizeContentRelationIds(
  serviceIds: string[],
  faqIds: string[],
): Promise<{ relatedServiceIds: string[]; attachedFaqIds: string[] }> {
  const uniqueServiceIds = [...new Set(serviceIds)];
  const uniqueFaqIds = [...new Set(faqIds)];

  const [services, faqs] = await Promise.all([
    uniqueServiceIds.length > 0
      ? prisma.service.findMany({
          where: { id: { in: uniqueServiceIds }, deletedAt: null },
          select: { id: true },
        })
      : Promise.resolve([]),
    uniqueFaqIds.length > 0
      ? prisma.fAQ.findMany({
          where: { id: { in: uniqueFaqIds }, isActive: true },
          select: { id: true },
        })
      : Promise.resolve([]),
  ]);

  const validServiceIds = new Set(services.map((service) => service.id));
  const validFaqIds = new Set(faqs.map((faq) => faq.id));

  return {
    relatedServiceIds: uniqueServiceIds.filter((id) => validServiceIds.has(id)),
    attachedFaqIds: uniqueFaqIds.filter((id) => validFaqIds.has(id)),
  };
}
