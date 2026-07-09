import "server-only";

import { rankRelatedBlogPosts } from "@/features/blog/lib/related-posts";
import { Repository } from "@/server/repositories/base/repository";

const publishedPostSelect = {
  id: true,
  slug: true,
  titleEn: true,
  titleUr: true,
  excerptEn: true,
  excerptUr: true,
  contentEn: true,
  contentUr: true,
  categoryEn: true,
  categoryUr: true,
  categoryId: true,
  subCategoryId: true,
  tags: true,
  authorNameEn: true,
  authorNameUr: true,
  readingTimeMinutes: true,
  featuredImagePath: true,
  featuredImageTitleEn: true,
  featuredImageTitleUr: true,
  featuredImageAltEn: true,
  featuredImageAltUr: true,
  featuredImageCaptionEn: true,
  featuredImageCaptionUr: true,
  focusKeywords: true,
  isFeatured: true,
  showTableOfContents: true,
  contentFaqs: true,
  ctaTitleEn: true,
  ctaTitleUr: true,
  ctaDescriptionEn: true,
  ctaDescriptionUr: true,
  ctaWhatsappLabelEn: true,
  ctaWhatsappLabelUr: true,
  ctaRequestLabelEn: true,
  ctaRequestLabelUr: true,
  ctaAccountLabelEn: true,
  ctaAccountLabelUr: true,
  relatedServiceIds: true,
  attachedFaqIds: true,
  publishedAt: true,
  updatedAt: true,
  seoMeta: true,
  category: {
    select: { id: true, nameEn: true, nameUr: true, slug: true },
  },
  subCategory: {
    select: { id: true, nameEn: true, nameUr: true, slug: true },
  },
} as const;

const publishedCardSelect = {
  id: true,
  slug: true,
  titleEn: true,
  titleUr: true,
  excerptEn: true,
  excerptUr: true,
  categoryEn: true,
  categoryUr: true,
  authorNameEn: true,
  authorNameUr: true,
  readingTimeMinutes: true,
  featuredImagePath: true,
  featuredImageAltEn: true,
  featuredImageAltUr: true,
  isFeatured: true,
  tags: true,
  publishedAt: true,
  updatedAt: true,
  seoMeta: true,
} as const;

export type BlogListFilters = {
  q?: string;
  category?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
  excludeSlug?: string;
};

export class BlogPostRepository extends Repository {
  buildPublishedWhere(filters: BlogListFilters = {}) {
    const where: {
      isPublished: true;
      slug?: { not: string };
      OR?: Array<Record<string, unknown>>;
      categoryEn?: { equals: string; mode: "insensitive" };
      tags?: { has: string };
    } = {
      isPublished: true,
    };

    if (filters.excludeSlug) {
      where.slug = { not: filters.excludeSlug };
    }

    if (filters.q?.trim()) {
      const q = filters.q.trim();
      where.OR = [
        { titleEn: { contains: q, mode: "insensitive" } },
        { titleUr: { contains: q, mode: "insensitive" } },
        { excerptEn: { contains: q, mode: "insensitive" } },
        { excerptUr: { contains: q, mode: "insensitive" } },
      ];
    }

    if (filters.category?.trim()) {
      where.categoryEn = {
        equals: filters.category.trim(),
        mode: "insensitive",
      };
    }

    if (filters.tag?.trim()) {
      where.tags = { has: filters.tag.trim().toLowerCase() };
    }

    return where;
  }

  async listPublished(limit = 50) {
    return this.query(
      () =>
        this.db.blogPost.findMany({
          where: { isPublished: true },
          orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
          take: limit,
          select: publishedCardSelect,
        }),
      [],
    );
  }

  async listPublishedPaginated(filters: BlogListFilters = {}) {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(filters.pageSize ?? 12, 50);
    const skip = (page - 1) * pageSize;
    const where = this.buildPublishedWhere(filters);

    const [items, total] = await Promise.all([
      this.db.blogPost.findMany({
        where,
        orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
        select: publishedCardSelect,
      }),
      this.db.blogPost.count({ where }),
    ]);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async listPublishedCategories() {
    const rows = await this.db.blogPost.findMany({
      where: { isPublished: true, categoryEn: { not: null } },
      select: { categoryEn: true, categoryUr: true },
      distinct: ["categoryEn"],
      orderBy: { categoryEn: "asc" },
    });

    return rows.filter((row) => row.categoryEn);
  }

  async findFeaturedPublished() {
    return this.query(
      () =>
        this.db.blogPost.findFirst({
          where: { isPublished: true, isFeatured: true },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          select: publishedCardSelect,
        }),
      null,
    );
  }

  async findPublishedBySlug(slug: string) {
    return this.query(
      () =>
        this.db.blogPost.findFirst({
          where: {
            slug,
            isPublished: true,
          },
          select: publishedPostSelect,
        }),
      null,
    );
  }

  async findRelatedPublished(
    current: {
      id: string;
      slug: string;
      categoryEn?: string | null;
      tags?: string[];
    },
    limit = 3,
  ) {
    const candidates = await this.listPublished(24);
    return rankRelatedBlogPosts(current, candidates, limit);
  }
}

export const blogPostRepository = new BlogPostRepository();
