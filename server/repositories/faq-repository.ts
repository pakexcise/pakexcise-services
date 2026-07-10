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

const publicFaqWhere = {
  isActive: true,
  faqCategory: { isActive: true },
} as const;

const globalPublicWhere = {
  ...publicFaqWhere,
  serviceId: null,
} as const;

export class FaqRepository extends Repository {
  async listAllPublic() {
    return this.query(
      () =>
        this.db.fAQ.findMany({
          where: publicFaqWhere,
          orderBy: [
            { faqCategory: { displayOrder: "asc" } },
            { displayOrder: "asc" },
          ],
          select: publicFaqSelect,
        }),
      [],
    );
  }

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
    const take =
      typeof limit === "number" && Number.isFinite(limit)
        ? Math.min(50, Math.max(1, Math.trunc(limit)))
        : undefined;

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
          ...(take ? { take } : {}),
          select: publicFaqSelect,
        }),
      [],
    );
  }

  async listByServiceId(serviceId: string, regionId?: string | null) {
    return this.query(
      () =>
        this.db.fAQ.findMany({
          where: {
            ...publicFaqWhere,
            serviceId,
            ...(regionId
              ? {
                  OR: [{ regionId: null }, { regionId }],
                }
              : {}),
          },
          orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
          select: publicFaqSelect,
        }),
      [],
    );
  }

  async listPublic() {
    return this.listAllPublic();
  }

  async listPublicPaginated(page = 1, pageSize = 20) {
    return this.query(
      () =>
        paginate(
          ({ skip, take }) =>
            this.db.fAQ.findMany({
              where: publicFaqWhere,
              orderBy: [
                { faqCategory: { displayOrder: "asc" } },
                { displayOrder: "asc" },
              ],
              skip,
              take,
              select: publicFaqSelect,
            }),
          () => this.db.fAQ.count({ where: publicFaqWhere }),
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
