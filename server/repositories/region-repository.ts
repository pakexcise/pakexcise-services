import "server-only";

import { activeOnly, Repository } from "@/server/repositories/base/repository";

export class RegionRepository extends Repository {
  async listPublic() {
    return this.query(
      () =>
        this.db.region.findMany({
          where: activeOnly(),
          orderBy: { displayOrder: "asc" },
          select: {
            id: true,
            slug: true,
            nameEn: true,
            nameUr: true,
            descriptionEn: true,
            descriptionUr: true,
            displayOrder: true,
            updatedAt: true,
          },
        }),
      [],
    );
  }

  async findPublicBySlug(slug: string) {
    return this.query(
      () =>
        this.db.region.findFirst({
          where: {
            slug,
            ...activeOnly(),
          },
          select: {
            id: true,
            slug: true,
            nameEn: true,
            nameUr: true,
            descriptionEn: true,
            descriptionUr: true,
            displayOrder: true,
            updatedAt: true,
            seoMeta: true,
          },
        }),
      null,
    );
  }

  async listAdmin() {
    return this.db.region.findMany({
      where: { deletedAt: null },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        slug: true,
        nameEn: true,
        nameUr: true,
        isActive: true,
      },
    });
  }

  async listActiveSlugs(): Promise<Array<{ slug: string; updatedAt: Date }>> {
    return this.db.region.findMany({
      where: activeOnly(),
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  }
}

export const regionRepository = new RegionRepository();
