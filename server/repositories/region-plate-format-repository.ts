import "server-only";

import type { Prisma } from "@prisma/client";

import { isPlateFormatSchemaReady } from "@/server/db/is-plate-format-schema-ready";
import { Repository } from "@/server/repositories/base/repository";

const publicPlateFormatSelect = {
  id: true,
  vehicleType: true,
  titleEn: true,
  formatsJson: true,
  descriptionEn: true,
  relatedServiceSlugs: true,
  imageR2Key: true,
  imageMimeType: true,
  imageAltEn: true,
  imageCaptionEn: true,
  isFeatured: true,
  displayOrder: true} as const satisfies Prisma.RegionNumberPlateFormatSelect;

const publicSectionSelect = {
  sectionTitleEn: true,
  sectionDescEn: true,
  faqJson: true,
  isActive: true,
  showOnRegionPage: true} as const satisfies Prisma.RegionPlateFormatSectionSelect;

export type PublicRegionPlateFormat = Prisma.RegionNumberPlateFormatGetPayload<{
  select: typeof publicPlateFormatSelect;
}>;

export type PublicRegionPlateFormatSection = Prisma.RegionPlateFormatSectionGetPayload<{
  select: typeof publicSectionSelect;
}>;

export type PublicRegionPlateFormatsBundle = {
  section: PublicRegionPlateFormatSection | null;
  formats: PublicRegionPlateFormat[];
};

export class RegionPlateFormatRepository extends Repository {
  async findPublicByRegionId(
    regionId: string,
  ): Promise<PublicRegionPlateFormatsBundle> {
    if (!isPlateFormatSchemaReady(this.db)) {
      return { section: null, formats: [] };
    }

    const [section, formats] = await Promise.all([
      this.db.regionPlateFormatSection.findUnique({
        where: { regionId },
        select: publicSectionSelect}),
      this.db.regionNumberPlateFormat.findMany({
        where: {
          regionId,
          isActive: true,
          showOnRegionPage: true,
          deletedAt: null},
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        select: publicPlateFormatSelect})]);

    if (section && (!section.isActive || !section.showOnRegionPage)) {
      return { section: null, formats: [] };
    }

    return { section, formats };
  }

  async findPublicImageMeta(formatId: string) {
    if (!isPlateFormatSchemaReady(this.db)) {
      return null;
    }

    return this.db.regionNumberPlateFormat.findFirst({
      where: {
        id: formatId,
        isActive: true,
        showOnRegionPage: true,
        deletedAt: null,
        imageR2Key: { not: null }},
      select: {
        id: true,
        imageR2Key: true,
        imageMimeType: true,
        updatedAt: true,
        region: {
          select: {
            isActive: true,
            deletedAt: true}}}});
  }
}

export const regionPlateFormatRepository = new RegionPlateFormatRepository();
