import "server-only";

import type { Prisma } from "@prisma/client";

import {
  paginate,
  Repository,
  type PaginatedResult,
} from "@/server/repositories/base/repository";

export const adminCityDetailSelect = {
  id: true,
  regionId: true,
  slug: true,
  nameEn: true,
  descriptionEn: true,
  isActive: true,
  displayOrder: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  region: {
    select: {
      id: true,
      slug: true,
      nameEn: true,
    },
  },
  seoMeta: true,
} as const satisfies Prisma.CitySelect;

export type AdminCityDetail = Prisma.CityGetPayload<{
  select: typeof adminCityDetailSelect;
}>;

export const adminCityListSelect = {
  id: true,
  regionId: true,
  slug: true,
  nameEn: true,
  isActive: true,
  displayOrder: true,
  updatedAt: true,
  deletedAt: true,
  region: {
    select: {
      slug: true,
      nameEn: true,
    },
  },
} as const satisfies Prisma.CitySelect;

export type AdminCityListItem = Prisma.CityGetPayload<{
  select: typeof adminCityListSelect;
}>;

export type AdminCityListFilters = {
  page?: number;
  pageSize?: number;
  regionId?: string;
  q?: string;
  active?: "true" | "false" | "all";
};

export class AdminCityRepository extends Repository {
  buildListWhere(filters: AdminCityListFilters): Prisma.CityWhereInput {
    const where: Prisma.CityWhereInput = {
      deletedAt: null,
    };

    if (filters.regionId) {
      where.regionId = filters.regionId;
    }

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
    filters: AdminCityListFilters = {},
  ): Promise<PaginatedResult<AdminCityListItem>> {
    const where = this.buildListWhere(filters);

    return paginate(
      ({ skip, take }) =>
        this.db.city.findMany({
          where,
          orderBy: [{ displayOrder: "asc" }, { nameEn: "asc" }],
          skip,
          take,
          select: adminCityListSelect,
        }),
      () => this.db.city.count({ where }),
      filters,
    );
  }

  listByRegionId(regionId: string): Promise<AdminCityListItem[]> {
    return this.db.city.findMany({
      where: { regionId, deletedAt: null },
      orderBy: { displayOrder: "asc" },
      select: adminCityListSelect,
    });
  }

  findById(id: string): Promise<AdminCityDetail | null> {
    return this.db.city.findFirst({
      where: { id, deletedAt: null },
      select: adminCityDetailSelect,
    });
  }
}

export const adminCityRepository = new AdminCityRepository();
