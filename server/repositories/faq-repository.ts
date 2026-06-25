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
  categoryId: true,
  isFeatured: true,
  featuredDisplayOrder: true,
  faqCategory: {
    select: {
      id: true,
      slug: true,
      nameEn: true,
      nameUr: true,
      displayOrder: true,
    },
  },
} as const;

const globalPublicWhere = {
  isActive: true,
  serviceId: null,
  faqCategory: { isActive: true },
} as const;

export class FaqRepository extends Repository {
  async listGlobalPublic() {
    return this.query(
      () =>
        this.db.fAQ.findMany({
          where: globalPublicWhere,
          orderBy: [
            { faqCategory: { displayOrder: "asc" } },
            { displayOrder: "asc" },
          ],
          select: publicFaqSelect,
        }),
      [],
    );
  }

  async listFeaturedGlobalPublic(limit?: number) {
    return this.query(
      () =>
        this.db.fAQ.findMany({
          where: {
            ...globalPublicWhere,
            isFeatured: true,
          },
          orderBy: [
            { featuredDisplayOrder: "asc" },
            { displayOrder: "asc" },
          ],
          take: limit,
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
            faqCategory: { isActive: true },
          },
          orderBy: [
            { faqCategory: { displayOrder: "asc" } },
            { displayOrder: "asc" },
          ],
          select: publicFaqSelect,
        }),
      [],
    );
  }

  async listPublic() {
    return this.listGlobalPublic();
  }

  async listPublicPaginated(page = 1, pageSize = 20) {
    return this.query(
      () =>
        paginate(
          ({ skip, take }) =>
            this.db.fAQ.findMany({
              where: globalPublicWhere,
              orderBy: [
                { faqCategory: { displayOrder: "asc" } },
                { displayOrder: "asc" },
              ],
              skip,
              take,
              select: publicFaqSelect,
            }),
          () => this.db.fAQ.count({ where: globalPublicWhere }),
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
