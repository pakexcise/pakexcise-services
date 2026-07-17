import "server-only";

import type { Prisma } from "@prisma/client";

import { activeSeoMetaWhere } from "@/features/seo/admin/lib/obsolete-seo";
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
  ogTitleEn: true,
  ogDescriptionEn: true,
  ogImage: true,
  twitterCard: true,
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

function buildListWhere(
  filters: AdminSeoListFilters,
): Prisma.SeoMetaWhereInput {
  const parts: Prisma.SeoMetaWhereInput[] = [];

  if (filters.q?.trim()) {
    const q = filters.q.trim();
    parts.push({
      OR: [
        { pageKey: { contains: q, mode: "insensitive" } },
        { metaTitleEn: { contains: q, mode: "insensitive" } },
        { metaDescriptionEn: { contains: q, mode: "insensitive" } },
        { h1En: { contains: q, mode: "insensitive" } },
        { focusKeywords: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (filters.missing === "title") {
    parts.push({ OR: [{ metaTitleEn: null }, { metaTitleEn: "" }] });
  } else if (filters.missing === "description") {
    parts.push({
      OR: [{ metaDescriptionEn: null }, { metaDescriptionEn: "" }],
    });
  } else if (filters.missing === "h1") {
    parts.push({ OR: [{ h1En: null }, { h1En: "" }] });
  } else if (filters.missing === "keywords") {
    parts.push({ OR: [{ focusKeywords: null }, { focusKeywords: "" }] });
  }

  return activeSeoMetaWhere(parts.length > 0 ? { AND: parts } : {});
}

export class AdminSeoRepository extends Repository {
  async listPaginated(
    filters: AdminSeoListFilters,
  ): Promise<PaginatedResult<AdminSeoListItem>> {
    const where = buildListWhere(filters);
    const pageSize = Math.min(filters.pageSize ?? 20, 100);

    return paginate(
      ({ skip, take }) =>
        this.db.seoMeta.findMany({
          where,
          orderBy: [{ pageKey: "asc" }],
          skip,
          take,
          select: adminSeoListSelect,
        }),
      () => this.db.seoMeta.count({ where }),
      { page: filters.page, pageSize },
    );
  }

  async listAllDetailed(
    filters: Pick<AdminSeoListFilters, "q" | "missing"> = {},
  ): Promise<AdminSeoListItem[]> {
    const where = buildListWhere(filters);
    return this.db.seoMeta.findMany({
      where,
      orderBy: [{ pageKey: "asc" }],
      select: adminSeoListSelect,
    });
  }

  async countObsoleteGuideRecords(): Promise<number> {
    return this.db.seoMeta.count({
      where: { pageKey: { startsWith: "guide:" } },
    });
  }

  async deleteObsoleteGuideRecords(): Promise<number> {
    const result = await this.db.seoMeta.deleteMany({
      where: { pageKey: { startsWith: "guide:" } },
    });
    return result.count;
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
        blogPost: {
          select: { slug: true, titleEn: true, focusKeywords: true },
        },
        legalPage: { select: { slug: true, titleEn: true } },
      },
    });
  }

  async findByPageKey(pageKey: string) {
    return this.db.seoMeta.findUnique({ where: { pageKey } });
  }
}

export const adminSeoRepository = new AdminSeoRepository();
