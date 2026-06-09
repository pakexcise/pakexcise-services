import "server-only";

import type { Prisma } from "@prisma/client";

import {
  paginate,
  Repository,
  type PaginatedResult,
} from "@/server/repositories/base/repository";

export const adminSeoListSelect = {
  id: true,
  pageKey: true,
  metaTitleEn: true,
  metaTitleUr: true,
  canonicalUrl: true,
  robotsIndex: true,
  robotsFollow: true,
  updatedAt: true,
  service: { select: { slug: true, nameEn: true } },
  region: { select: { slug: true, nameEn: true } },
  blogPost: { select: { slug: true, titleEn: true } },
  guide: { select: { slug: true, titleEn: true } },
} as const satisfies Prisma.SeoMetaSelect;

export type AdminSeoListItem = Prisma.SeoMetaGetPayload<{
  select: typeof adminSeoListSelect;
}>;

export type AdminSeoListFilters = {
  page?: number;
  pageSize?: number;
  q?: string;
};

export class AdminSeoRepository extends Repository {
  async listPaginated(
    filters: AdminSeoListFilters,
  ): Promise<PaginatedResult<AdminSeoListItem>> {
    const where: Prisma.SeoMetaWhereInput = {};

    if (filters.q?.trim()) {
      const q = filters.q.trim();
      where.OR = [
        { pageKey: { contains: q, mode: "insensitive" } },
        { metaTitleEn: { contains: q, mode: "insensitive" } },
        { metaTitleUr: { contains: q, mode: "insensitive" } },
      ];
    }

    const pageSize = Math.min(filters.pageSize ?? 20, 100);

    return paginate(
      ({ skip, take }) =>
        this.db.seoMeta.findMany({
          where,
          orderBy: [{ updatedAt: "desc" }],
          skip,
          take,
          select: adminSeoListSelect,
        }),
      () => this.db.seoMeta.count({ where }),
      { page: filters.page, pageSize },
    );
  }

  async findById(id: string) {
    return this.db.seoMeta.findUnique({ where: { id } });
  }

  async findByPageKey(pageKey: string) {
    return this.db.seoMeta.findUnique({ where: { pageKey } });
  }
}

export const adminSeoRepository = new AdminSeoRepository();
