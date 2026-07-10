import "server-only";

import { Repository } from "@/server/repositories/base/repository";

const publishedGuideSelect = {
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

export class GuideRepository extends Repository {
  async listPublished(limit = 50) {
    const take = Number.isFinite(limit)
      ? Math.min(100, Math.max(1, Math.trunc(limit)))
      : 50;

    return this.query(
      () =>
        this.db.guide.findMany({
          where: {
            isPublished: true,
          },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take,
          select: publishedGuideSelect,
        }),
      [],
    );
  }

  async findPublishedBySlug(slug: string) {
    return this.query(
      () =>
        this.db.guide.findFirst({
          where: {
            slug,
            isPublished: true,
          },
          select: publishedGuideSelect,
        }),
      null,
    );
  }
}

export const guideRepository = new GuideRepository();
