import "server-only";

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
  relatedServiceIds: true,
  attachedFaqIds: true,
  publishedAt: true,
  updatedAt: true,
  seoMeta: true,
} as const;

export class BlogPostRepository extends Repository {
  async listPublished(limit = 50) {
    return this.query(
      () =>
        this.db.blogPost.findMany({
          where: {
            isPublished: true,
          },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: limit,
          select: publishedPostSelect,
        }),
      [],
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
}

export const blogPostRepository = new BlogPostRepository();
