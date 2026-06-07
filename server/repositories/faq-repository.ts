import "server-only";

import { paginate, Repository } from "@/server/repositories/base/repository";

const publicFaqSelect = {
  id: true,
  questionEn: true,
  questionUr: true,
  answerEn: true,
  answerUr: true,
  displayOrder: true,
  serviceId: true,
} as const;

export class FaqRepository extends Repository {
  async listGlobalPublic() {
    return this.query(
      () =>
        this.db.fAQ.findMany({
          where: {
            isActive: true,
            serviceId: null,
          },
          orderBy: { displayOrder: "asc" },
          select: publicFaqSelect,
        }),
      [],
    );
  }

  async listByServiceId(serviceId: string) {
    return this.query(
      () =>
        this.db.fAQ.findMany({
          where: {
            isActive: true,
            serviceId,
          },
          orderBy: { displayOrder: "asc" },
          select: publicFaqSelect,
        }),
      [],
    );
  }

  async listPublic() {
    return this.listGlobalPublic();
  }

  async listPublicPaginated(page = 1, pageSize = 20) {
    const where = {
      isActive: true,
      serviceId: null,
    };

    return this.query(
      () =>
        paginate(
          ({ skip, take }) =>
            this.db.fAQ.findMany({
              where,
              orderBy: { displayOrder: "asc" },
              skip,
              take,
              select: publicFaqSelect,
            }),
          () => this.db.fAQ.count({ where }),
          { page, pageSize },
        ),
      {
        items: [],
        page: 1,
        pageSize,
        total: 0,
        totalPages: 1,
      },
    );
  }
}

export const faqRepository = new FaqRepository();
