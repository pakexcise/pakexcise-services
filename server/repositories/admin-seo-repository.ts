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
  metaDescriptionEn: true,
  h1En: true,
  focusKeywords: true,
  canonicalUrl: true,
  robotsIndex: true,
  robotsFollow: true,
  updatedAt: true,
  serviceId: true,
  regionId: true,
  cityId: true,
  blogPostId: true,
  legalPageId: true,
  service: { select: { slug: true, nameEn: true } },
  region: { select: { slug: true, nameEn: true } },
  city: {
    select: {
      slug: true,
      nameEn: true,
      region: { select: { slug: true } },
    },
  },
  blogPost: { select: { slug: true, titleEn: true, focusKeywords: true } },
  legalPage: { select: { slug: true, titleEn: true } },
} as const satisfies Prisma.SeoMetaSelect;

export type AdminSeoListItem = Prisma.SeoMetaGetPayload<{
  select: typeof adminSeoListSelect;
}>;

export type AdminSeoListFilters = {
  page?: number;
  pageSize?: number;
  q?: string;
  missing?: "title" | "description" | "h1" | "keywords";
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
        { metaDescriptionEn: { contains: q, mode: "insensitive" } },
        { h1En: { contains: q, mode: "insensitive" } },
        { focusKeywords: { contains: q, mode: "insensitive" } },
      ];
    }

    if (filters.missing === "title") {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        { OR: [{ metaTitleEn: null }, { metaTitleEn: "" }] },
      ];
    } else if (filters.missing === "description") {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        { OR: [{ metaDescriptionEn: null }, { metaDescriptionEn: "" }] },
      ];
    } else if (filters.missing === "h1") {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        { OR: [{ h1En: null }, { h1En: "" }] },
      ];
    } else if (filters.missing === "keywords") {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        { OR: [{ focusKeywords: null }, { focusKeywords: "" }] },
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

  async findByIdForEdit(id: string) {
    return this.db.seoMeta.findUnique({
      where: { id },
      include: {
        service: { select: { slug: true, nameEn: true } },
        region: { select: { slug: true, nameEn: true } },
        city: {
          select: {
            slug: true,
            nameEn: true,
            region: { select: { slug: true } },
          },
        },
        blogPost: { select: { slug: true, titleEn: true, focusKeywords: true } },
        legalPage: { select: { slug: true, titleEn: true } },
      },
    });
  }

  async findByPageKey(pageKey: string) {
    return this.db.seoMeta.findUnique({ where: { pageKey } });
  }
}

export const adminSeoRepository = new AdminSeoRepository();
