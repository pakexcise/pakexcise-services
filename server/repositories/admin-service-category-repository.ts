import "server-only";

import type { Prisma } from "@prisma/client";

import {
  paginate,
  Repository,
  type PaginatedResult,
} from "@/server/repositories/base/repository";

export const adminServiceCategoryDetailSelect = {
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
      services: true,
    },
  },
} as const satisfies Prisma.ServiceCategorySelect;

export type AdminServiceCategoryDetail = Prisma.ServiceCategoryGetPayload<{
  select: typeof adminServiceCategoryDetailSelect;
}>;

export const adminServiceCategoryListSelect = {
  id: true,
  slug: true,
  nameEn: true,
  isActive: true,
  displayOrder: true,
  updatedAt: true,
  _count: {
    select: {
      services: true,
    },
  },
} as const satisfies Prisma.ServiceCategorySelect;

export type AdminServiceCategoryListItem = Prisma.ServiceCategoryGetPayload<{
  select: typeof adminServiceCategoryListSelect;
}>;

export type AdminServiceCategoryListFilters = {
  page?: number;
  pageSize?: number;
  q?: string;
  active?: "true" | "false" | "all";
};

export class AdminServiceCategoryRepository extends Repository {
  buildListWhere(
    filters: AdminServiceCategoryListFilters,
  ): Prisma.ServiceCategoryWhereInput {
    const where: Prisma.ServiceCategoryWhereInput = {};

    if (filters.active === "true") {
      where.isActive = true;
    } else if (filters.active === "false") {
      where.isActive = false;
    }

    if (filters.q) {
      where.OR = [
        { nameEn: { contains: filters.q, mode: "insensitive" } },

        { slug: { contains: filters.q, mode: "insensitive" } },
      ];
    }

    return where;
  }

  listPaginated(
    filters: AdminServiceCategoryListFilters = {},
  ): Promise<PaginatedResult<AdminServiceCategoryListItem>> {
    const where = this.buildListWhere(filters);

    return paginate(
      ({ skip, take }) =>
        this.db.serviceCategory.findMany({
          where,
          orderBy: [{ displayOrder: "asc" }, { nameEn: "asc" }],
          skip,
          take,
          select: adminServiceCategoryListSelect,
        }),
      () => this.db.serviceCategory.count({ where }),
      filters,
    );
  }

  findById(id: string): Promise<AdminServiceCategoryDetail | null> {
    return this.db.serviceCategory.findUnique({
      where: { id },
      select: adminServiceCategoryDetailSelect,
    });
  }

  findBySlug(slug: string): Promise<AdminServiceCategoryDetail | null> {
    return this.db.serviceCategory.findUnique({
      where: { slug },
      select: adminServiceCategoryDetailSelect,
    });
  }

  listAdmin(): Promise<AdminServiceCategoryListItem[]> {
    return this.db.serviceCategory.findMany({
      orderBy: [{ displayOrder: "asc" }, { nameEn: "asc" }],
      select: adminServiceCategoryListSelect,
    });
  }

  getNextDisplayOrder(): Promise<number> {
    return this.db.serviceCategory
      .aggregate({ _max: { displayOrder: true } })
      .then((result) => (result._max.displayOrder ?? -1) + 1);
  }
}

export const adminServiceCategoryRepository =
  new AdminServiceCategoryRepository();
