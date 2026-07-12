import "server-only";

import type { Prisma } from "@prisma/client";

import {
  paginate,
  Repository,
  type PaginatedResult,
} from "@/server/repositories/base/repository";

export const adminFaqCategoryDetailSelect = {
  id: true,
  slug: true,
  nameEn: true,
  descriptionEn: true,
  isActive: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      faqs: true,
    },
  },
} as const satisfies Prisma.FaqCategorySelect;

export type AdminFaqCategoryDetail = Prisma.FaqCategoryGetPayload<{
  select: typeof adminFaqCategoryDetailSelect;
}>;

export const adminFaqCategoryListSelect = {
  id: true,
  slug: true,
  nameEn: true,
  isActive: true,
  displayOrder: true,
  updatedAt: true,
  _count: {
    select: {
      faqs: true,
    },
  },
} as const satisfies Prisma.FaqCategorySelect;

export type AdminFaqCategoryListItem = Prisma.FaqCategoryGetPayload<{
  select: typeof adminFaqCategoryListSelect;
}>;

export type AdminFaqCategoryListFilters = {
  page?: number;
  pageSize?: number;
  q?: string;
  active?: "true" | "false" | "all";
};

export class AdminFaqCategoryRepository extends Repository {
  buildListWhere(
    filters: AdminFaqCategoryListFilters,
  ): Prisma.FaqCategoryWhereInput {
    const where: Prisma.FaqCategoryWhereInput = {};

    if (filters.active === "true") {
      where.isActive = true;
    } else if (filters.active === "false") {
      where.isActive = false;
    }

    if (filters.q?.trim()) {
      const query = filters.q.trim();
      where.OR = [
        { nameEn: { contains: query, mode: "insensitive" } },

        { slug: { contains: query, mode: "insensitive" } },
      ];
    }

    return where;
  }

  listPaginated(
    filters: AdminFaqCategoryListFilters = {},
  ): Promise<PaginatedResult<AdminFaqCategoryListItem>> {
    const where = this.buildListWhere(filters);

    return paginate(
      ({ skip, take }) =>
        this.db.faqCategory.findMany({
          where,
          orderBy: [{ displayOrder: "asc" }, { nameEn: "asc" }],
          skip,
          take,
          select: adminFaqCategoryListSelect,
        }),
      () => this.db.faqCategory.count({ where }),
      filters,
    );
  }

  findById(id: string): Promise<AdminFaqCategoryDetail | null> {
    return this.db.faqCategory.findUnique({
      where: { id },
      select: adminFaqCategoryDetailSelect,
    });
  }

  findBySlug(slug: string): Promise<AdminFaqCategoryDetail | null> {
    return this.db.faqCategory.findUnique({
      where: { slug },
      select: adminFaqCategoryDetailSelect,
    });
  }

  listForSelect(): Promise<AdminFaqCategoryListItem[]> {
    return this.db.faqCategory.findMany({
      orderBy: [{ displayOrder: "asc" }, { nameEn: "asc" }],
      select: adminFaqCategoryListSelect,
    });
  }

  listActiveForSelect(): Promise<AdminFaqCategoryListItem[]> {
    return this.db.faqCategory.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { nameEn: "asc" }],
      select: adminFaqCategoryListSelect,
    });
  }

  getNextDisplayOrder(): Promise<number> {
    return this.db.faqCategory
      .aggregate({ _max: { displayOrder: true } })
      .then((result) => (result._max.displayOrder ?? -1) + 1);
  }
}

export const adminFaqCategoryRepository = new AdminFaqCategoryRepository();
