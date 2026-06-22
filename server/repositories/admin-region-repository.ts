import "server-only";

import type { Prisma } from "@prisma/client";

import {
  activeOnly,
  paginate,
  Repository,
  type PaginatedResult,
} from "@/server/repositories/base/repository";

export const adminRegionDetailSelect = {
  id: true,
  slug: true,
  nameEn: true,
  nameUr: true,
  descriptionEn: true,
  descriptionUr: true,
  isActive: true,
  showInFooter: true,
  footerDisplayOrder: true,
  displayOrder: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  seoMeta: true,
  _count: {
    select: {
      cities: true,
      serviceRegions: true,
    },
  },
} as const satisfies Prisma.RegionSelect;

export type AdminRegionDetail = Prisma.RegionGetPayload<{
  select: typeof adminRegionDetailSelect;
}>;

export const adminRegionListSelect = {
  id: true,
  slug: true,
  nameEn: true,
  nameUr: true,
  isActive: true,
  showInFooter: true,
  footerDisplayOrder: true,
  displayOrder: true,
  updatedAt: true,
  deletedAt: true,
  _count: {
    select: {
      cities: true,
      serviceRegions: true,
    },
  },
} as const satisfies Prisma.RegionSelect;

export type AdminRegionListItem = Prisma.RegionGetPayload<{
  select: typeof adminRegionListSelect;
}>;

export type AdminRegionListFilters = {
  page?: number;
  pageSize?: number;
  q?: string;
  active?: "true" | "false" | "all";
};

export class AdminRegionRepository extends Repository {
  buildListWhere(filters: AdminRegionListFilters): Prisma.RegionWhereInput {
    const where: Prisma.RegionWhereInput = {
      deletedAt: null,
    };

    if (filters.active === "true") {
      where.isActive = true;
    } else if (filters.active === "false") {
      where.isActive = false;
    }

    if (filters.q) {
      where.OR = [
        { nameEn: { contains: filters.q, mode: "insensitive" } },
        { nameUr: { contains: filters.q, mode: "insensitive" } },
        { slug: { contains: filters.q, mode: "insensitive" } },
      ];
    }

    return where;
  }

  listPaginated(
    filters: AdminRegionListFilters = {},
  ): Promise<PaginatedResult<AdminRegionListItem>> {
    const where = this.buildListWhere(filters);

    return paginate(
      ({ skip, take }) =>
        this.db.region.findMany({
          where,
          orderBy: [{ displayOrder: "asc" }, { nameEn: "asc" }],
          skip,
          take,
          select: adminRegionListSelect,
        }),
      () => this.db.region.count({ where }),
      filters,
    );
  }

  findById(id: string): Promise<AdminRegionDetail | null> {
    return this.db.region.findFirst({
      where: { id, deletedAt: null },
      select: adminRegionDetailSelect,
    });
  }

  findBySlug(slug: string): Promise<AdminRegionDetail | null> {
    return this.db.region.findFirst({
      where: { slug, deletedAt: null },
      select: adminRegionDetailSelect,
    });
  }

  listOptions(): Promise<Array<{ id: string; nameEn: string; nameUr: string }>> {
    return this.db.region.findMany({
      where: activeOnly(),
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        nameEn: true,
        nameUr: true,
      },
    });
  }
}

export const adminRegionRepository = new AdminRegionRepository();
