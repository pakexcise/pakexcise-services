import "server-only";

import type { Prisma } from "@prisma/client";

import {
  paginate,
  Repository,
  type PaginatedResult,
} from "@/server/repositories/base/repository";

export const adminBlogListSelect = {
  id: true,
  slug: true,
  titleEn: true,
  categoryEn: true,
  categoryId: true,
  subCategoryId: true,
  category: {
    select: { id: true, nameEn: true, slug: true },
  },
  subCategory: {
    select: { id: true, nameEn: true, slug: true },
  },
  isPublished: true,
  isFeatured: true,
  publishedAt: true,
  updatedAt: true,
} as const satisfies Prisma.BlogPostSelect;

export const adminBlogDetailSelect = {
  id: true,
  slug: true,
  titleEn: true,
  excerptEn: true,
  contentEn: true,
  categoryEn: true,
  categoryId: true,
  subCategoryId: true,
  tags: true,
  authorNameEn: true,
  readingTimeMinutes: true,
  featuredImagePath: true,
  featuredImageTitleEn: true,
  featuredImageAltEn: true,
  featuredImageCaptionEn: true,
  focusKeywords: true,
  isFeatured: true,
  showTableOfContents: true,
  contentFaqs: true,
  ctaTitleEn: true,
  ctaDescriptionEn: true,
  ctaWhatsappLabelEn: true,
  ctaRequestLabelEn: true,
  ctaAccountLabelEn: true,
  relatedServiceIds: true,
  attachedFaqIds: true,
  isPublished: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  seoMeta: true,
} as const satisfies Prisma.BlogPostSelect;

export type AdminBlogListItem = Prisma.BlogPostGetPayload<{
  select: typeof adminBlogListSelect;
}>;

export type AdminBlogDetail = Prisma.BlogPostGetPayload<{
  select: typeof adminBlogDetailSelect;
}>;

export type AdminBlogListFilters = {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: "published" | "draft" | "all";
  categoryId?: string;
  subCategoryId?: string;
};

export class AdminBlogRepository extends Repository {
  buildListWhere(filters: AdminBlogListFilters): Prisma.BlogPostWhereInput {
    const where: Prisma.BlogPostWhereInput = {};

    if (filters.status === "published") {
      where.isPublished = true;
    } else if (filters.status === "draft") {
      where.isPublished = false;
    }

    if (filters.q?.trim()) {
      const q = filters.q.trim();
      where.OR = [
        { titleEn: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { categoryEn: { contains: q, mode: "insensitive" } },
        { authorNameEn: { contains: q, mode: "insensitive" } },
      ];
    }

    if (filters.subCategoryId) {
      where.subCategoryId = filters.subCategoryId;
    } else if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    return where;
  }

  async listPaginated(
    filters: AdminBlogListFilters,
  ): Promise<PaginatedResult<AdminBlogListItem>> {
    const pageSize = Math.min(filters.pageSize ?? 20, 100);
    const where = this.buildListWhere(filters);

    return paginate(
      ({ skip, take }) =>
        this.db.blogPost.findMany({
          where,
          orderBy: [{ updatedAt: "desc" }],
          skip,
          take,
          select: adminBlogListSelect,
        }),
      () => this.db.blogPost.count({ where }),
      { page: filters.page, pageSize },
    );
  }

  async findById(id: string): Promise<AdminBlogDetail | null> {
    return this.db.blogPost.findUnique({
      where: { id },
      select: adminBlogDetailSelect,
    });
  }

  async findBySlug(slug: string) {
    return this.db.blogPost.findUnique({
      where: { slug },
      select: { id: true },
    });
  }
}

export const adminBlogRepository = new AdminBlogRepository();
