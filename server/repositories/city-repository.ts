import "server-only";

import { activeOnly, Repository } from "@/server/repositories/base/repository";

const publicCitySelect = {
  id: true,
  slug: true,
  regionId: true,
  nameEn: true,
  descriptionEn: true,
  displayOrder: true,
  updatedAt: true,
  region: {
    select: {
      id: true,
      slug: true,
      nameEn: true}},
  seoMeta: true} as const;

export class CityRepository extends Repository {
  async listPublic() {
    return this.query(
      () =>
        this.db.city.findMany({
          where: activeOnly(),
          orderBy: [{ displayOrder: "asc" }, { nameEn: "asc" }],
          select: {
            id: true,
            regionId: true,
            slug: true,
            nameEn: true}}),
      [],
    );
  }

  async listPublicByRegionId(regionId: string) {
    return this.query(
      () =>
        this.db.city.findMany({
          where: { regionId, ...activeOnly() },
          orderBy: { displayOrder: "asc" },
          select: {
            id: true,
            slug: true,
            nameEn: true,
            descriptionEn: true,
            displayOrder: true,
            updatedAt: true}}),
      [],
    );
  }

  async findPublicBySlug(regionId: string, slug: string) {
    return this.query(
      () =>
        this.db.city.findFirst({
          where: {
            regionId,
            slug,
            ...activeOnly()},
          select: publicCitySelect}),
      null,
    );
  }

  async findPublicByRegionSlugAndCitySlug(
    regionSlug: string,
    citySlug: string,
  ) {
    return this.query(
      () =>
        this.db.city.findFirst({
          where: {
            slug: citySlug,
            ...activeOnly(),
            region: {
              slug: regionSlug,
              ...activeOnly()}},
          select: publicCitySelect}),
      null,
    );
  }

  async listActiveSlugs(): Promise<
    Array<{ regionSlug: string; citySlug: string; updatedAt: Date }>
  > {
    return this.query(
      () =>
        this.db.city
          .findMany({
            where: activeOnly(),
            select: {
              slug: true,
              updatedAt: true,
              region: { select: { slug: true, isActive: true, deletedAt: true } }},
            orderBy: { updatedAt: "desc" }})
          .then((cities) =>
            cities
              .filter(
                (entry) =>
                  entry.region.isActive && entry.region.deletedAt === null,
              )
              .map((entry) => ({
                regionSlug: entry.region.slug,
                citySlug: entry.slug,
                updatedAt: entry.updatedAt})),
          ),
      [],
    );
  }
}

export const cityRepository = new CityRepository();
