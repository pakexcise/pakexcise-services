import "server-only";

import { activeOnly, Repository } from "@/server/repositories/base/repository";

export class RegionRepository extends Repository {
  async listPublic() {
    return this.db.region.findMany({
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
      },
    });
  }

  async findPublicBySlug(slug: string) {
    return this.db.region.findFirst({
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
      },
    });
  }
}

export const regionRepository = new RegionRepository();
