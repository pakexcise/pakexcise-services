import "server-only";

import { activeOnly, Repository } from "@/server/repositories/base/repository";
import { isFooterNavigationSchemaReady } from "@/server/db/is-footer-navigation-schema-ready";

const footerRegionSelect = {
  id: true,
  slug: true,
  nameEn: true,
  nameUr: true,
} as const;

export type FooterRegionLink = {
  id: string;
  slug: string;
  nameEn: string;
  nameUr: string;
};

export class RegionRepository extends Repository {
  async listPublicWithServiceCounts() {
    return this.query(async () => {
      const regions = await this.db.region.findMany({
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
          _count: {
            select: {
              serviceRegions: {
                where: {
                  isActive: true,
                  service: {
                    isActive: true,
                    deletedAt: null,
                    parentServiceId: null,
                  },
                },
              },
            },
          },
        },
      });

      return regions.map(({ _count, ...region }) => ({
        ...region,
        activeServiceCount: _count.serviceRegions,
      }));
    }, []);
  }

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

  async listFooterRegions(): Promise<FooterRegionLink[]> {
    if (!isFooterNavigationSchemaReady()) {
      return this.listFooterRegionsFallback();
    }

    const footerRegions = await this.query(
      () =>
        this.db.region.findMany({
          where: {
            ...activeOnly(),
            showInFooter: true,
          },
          orderBy: [{ footerDisplayOrder: "asc" }, { displayOrder: "asc" }],
          select: footerRegionSelect,
        }),
      [],
    );

    if (footerRegions.length > 0) {
      return footerRegions;
    }

    return this.listFooterRegionsFallback();
  }

  private async listFooterRegionsFallback(): Promise<FooterRegionLink[]> {
    return this.query(
      () =>
        this.db.region.findMany({
          where: activeOnly(),
          orderBy: { displayOrder: "asc" },
          select: footerRegionSelect,
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
    return this.query(
      () =>
        this.db.region.findMany({
          where: activeOnly(),
          select: {
            slug: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: "desc" },
        }),
      [],
    );
  }
}

export const regionRepository = new RegionRepository();

export async function getFooterRegions() {
  return regionRepository.listFooterRegions();
}
