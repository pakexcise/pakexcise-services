import "server-only";

import type { Prisma } from "@prisma/client";

import {
  paginate,
  Repository,
  type PaginatedResult,
} from "@/server/repositories/base/repository";

const faqCategorySelect = {
  id: true,
  slug: true,
  nameEn: true,
  nameUr: true,
} as const;

export const adminFaqListSelect = {
  id: true,
  categoryId: true,
  questionEn: true,
  questionUr: true,
  isActive: true,
  isFeatured: true,
  displayOrder: true,
  featuredDisplayOrder: true,
  serviceId: true,
  updatedAt: true,
  faqCategory: {
    select: faqCategorySelect,
  },
  service: {
    select: {
      id: true,
      slug: true,
      nameEn: true,
      nameUr: true,
    },
  },
} as const satisfies Prisma.FAQSelect;

export const adminFaqDetailSelect = {
  id: true,
  categoryId: true,
  questionEn: true,
  questionUr: true,
  answerEn: true,
  answerUr: true,
  isActive: true,
  isFeatured: true,
  displayOrder: true,
  featuredDisplayOrder: true,
  serviceId: true,
  createdAt: true,
  updatedAt: true,
  faqCategory: {
    select: faqCategorySelect,
  },
  service: {
    select: {
      id: true,
      slug: true,
      nameEn: true,
      nameUr: true,
    },
  },
} as const satisfies Prisma.FAQSelect;

export type AdminFaqListItem = Prisma.FAQGetPayload<{
  select: typeof adminFaqListSelect;
}>;

export type AdminFaqDetail = Prisma.FAQGetPayload<{
  select: typeof adminFaqDetailSelect;
}>;

export type AdminFaqListFilters = {
  page?: number;
  pageSize?: number;
  q?: string;
  categoryId?: string;
  serviceId?: string;
  active?: "true" | "false" | "all";
  featured?: "true" | "false" | "all";
};

export class AdminFaqRepository extends Repository {
  buildListWhere(filters: AdminFaqListFilters): Prisma.FAQWhereInput {
    const where: Prisma.FAQWhereInput = {};

    if (filters.active === "true") {
      where.isActive = true;
    } else if (filters.active === "false") {
      where.isActive = false;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.serviceId) {
      where.serviceId = filters.serviceId;
    }

    if (filters.featured === "true") {
      where.isFeatured = true;
    } else if (filters.featured === "false") {
      where.isFeatured = false;
    }

    if (filters.q?.trim()) {
      const query = filters.q.trim();
      where.OR = [
        { questionEn: { contains: query, mode: "insensitive" } },
        { questionUr: { contains: query, mode: "insensitive" } },
        { answerEn: { contains: query, mode: "insensitive" } },
        { answerUr: { contains: query, mode: "insensitive" } },
        { faqCategory: { nameEn: { contains: query, mode: "insensitive" } } },
        { faqCategory: { nameUr: { contains: query, mode: "insensitive" } } },
        { faqCategory: { slug: { contains: query, mode: "insensitive" } } },
      ];
    }

    return where;
  }

  async listPaginated(
    filters: AdminFaqListFilters = {},
  ): Promise<PaginatedResult<AdminFaqListItem>> {
    const pageSize = Math.min(filters.pageSize ?? 20, 100);
    const where = this.buildListWhere(filters);

    return paginate(
      ({ skip, take }) =>
        this.db.fAQ.findMany({
          where,
          orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
          skip,
          take,
          select: adminFaqListSelect,
        }),
      () => this.db.fAQ.count({ where }),
      { page: filters.page, pageSize },
    );
  }

  async findById(id: string): Promise<AdminFaqDetail | null> {
    return this.db.fAQ.findUnique({
      where: { id },
      select: adminFaqDetailSelect,
    });
  }

  async getNextDisplayOrder(serviceId?: string | null): Promise<number> {
    const last = await this.db.fAQ.findFirst({
      where: { serviceId: serviceId ?? null },
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });

    return (last?.displayOrder ?? 0) + 1;
  }
}

export const adminFaqRepository = new AdminFaqRepository();
