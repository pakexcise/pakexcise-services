import "server-only";

import { prisma } from "@/server/db/client";
import { adminServiceRepository } from "@/server/repositories/admin-service-repository";

export async function loadCmsEditorOptions() {
  const [services, faqs] = await Promise.all([
    adminServiceRepository.listForSelect(),
    prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      take: 100,
      select: { id: true, questionEn: true },
    }),
  ]);

  return {
    services: services.map((service) => ({
      id: service.id,
      label: service.nameEn,
    })),
    faqs: faqs.map((faq) => ({
      id: faq.id,
      label: faq.questionEn,
    })),
  };
}
