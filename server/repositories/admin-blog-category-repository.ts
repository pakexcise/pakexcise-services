import "server-only";

import type { Prisma } from "@prisma/client";

import {
  paginate,
  Repository,
  type PaginatedResult,
} from "@/server/repositories/base/repository";

export const adminBlogCategoryDetailSelect = {
  id: true,
  slug: true,
  nameEn: true,
  nameUr: true,
  parentId: true,
  isActive: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true,
  parent: {
    select: {
      id: true,
      nameEn: true,
      nameUr: true,
      slug: true,
    },
  },
  _count: {
    select: {
      posts: true,
      subPosts: true,
      children: true,
    },
  },
} as const satisfies Prisma.BlogCategorySelect;

export type AdminBlogCategoryDetail = Prisma.BlogCategoryGetPayload<{
  select: typeof adminBlogCategoryDetailSelect;
}>;

export const adminBlogCategoryListSelect = {
  id: true,
  slug: true,
  nameEn: true,
  nameUr: true,
  parentId: true,
  isActive: true,
  displayOrder: true,
  updatedAt: true,
  parent: {
    select: {
      id: true,
      nameEn: true,
      nameUr: true,
    },
  },
  _count: {
    select: {
      posts: true,
      subPosts: true,
      children: true,
    },
  },
} as const satisfies Prisma.BlogCategorySelect;

export type AdminBlogCategoryListItem = Prisma.BlogCategoryGetPayload<{
  select: typeof adminBlogCategoryListSelect;
}>;

export type AdminBlogCategoryListFilters = {
  page?: number;
  pageSize?: number;
  q?: string;
  active?: "true" | "false" | "all";
  level?: "all" | "parent" | "sub";
};

export class AdminBlogCategoryRepository extends Repository {
  buildListWhere(
    filters: AdminBlogCategoryListFilters,
  ): Prisma.BlogCategoryWhereInput {
    const where: Prisma.BlogCategoryWhereInput = {};

    if (filters.active === "true") {
      where.isActive = true;
    } else if (filters.active === "false") {
      where.isActive = false;
    }

    if (filters.level === "parent") {
      where.parentId = null;
    } else if (filters.level === "sub") {
      where.parentId = { not: null };
    }

    if (filters.q?.trim()) {
      const query = filters.q.trim();
      where.OR = [
        { nameEn: { contains: query, mode: "insensitive" } },
        { nameUr: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
      ];
    }

    return where;
  }

  listPaginated(
    filters: AdminBlogCategoryListFilters = {},
  ): Promise<PaginatedResult<AdminBlogCategoryListItem>> {
    const where = this.buildListWhere(filters);

    return paginate(
      ({ skip, take }) =>
        this.db.blogCategory.findMany({
          where,
          orderBy: [
            { parentId: "asc" },
            { displayOrder: "asc" },
            { nameEn: "asc" },
          ],
          skip,
          take,
          select: adminBlogCategoryListSelect,
        }),
      () => this.db.blogCategory.count({ where }),
      filters,
    );
  }

  findById(id: string): Promise<AdminBlogCategoryDetail | null> {
    return this.db.blogCategory.findUnique({
      where: { id },
      select: adminBlogCategoryDetailSelect,
    });
  }

  findBySlug(slug: string): Promise<AdminBlogCategoryDetail | null> {
    return this.db.blogCategory.findUnique({
      where: { slug },
      select: adminBlogCategoryDetailSelect,
    });
  }

  listParentsForSelect(): Promise<AdminBlogCategoryListItem[]> {
    return this.db.blogCategory.findMany({
      where: { parentId: null },
      orderBy: [{ displayOrder: "asc" }, { nameEn: "asc" }],
      select: adminBlogCategoryListSelect,
    });
  }

  listForFilter(): Promise<AdminBlogCategoryListItem[]> {
    return this.db.blogCategory.findMany({
      orderBy: [
        { parentId: "asc" },
        { displayOrder: "asc" },
        { nameEn: "asc" },
      ],
      select: adminBlogCategoryListSelect,
    });
  }

  getNextDisplayOrder(parentId: string | null): Promise<number> {
    return this.db.blogCategory
      .aggregate({
        where: { parentId },
        _max: { displayOrder: true },
      })
      .then((result) => (result._max.displayOrder ?? -1) + 1);
  }

  getAssignedPostCount(category: {
    _count: { posts: number; subPosts: number };
  }): number {
    return category._count.posts + category._count.subPosts;
  }
}

export const adminBlogCategoryRepository = new AdminBlogCategoryRepository();
