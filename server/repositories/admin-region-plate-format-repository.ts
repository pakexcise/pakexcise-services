import "server-only";

import type { Prisma } from "@prisma/client";

import { isPlateFormatSchemaReady } from "@/server/db/is-plate-format-schema-ready";
import { Repository } from "@/server/repositories/base/repository";

const adminFormatSelect = {
  id: true,
  regionId: true,
  vehicleType: true,
  titleEn: true,
  formatsJson: true,
  descriptionEn: true,
  relatedServiceSlugs: true,
  imageR2Key: true,
  imageMimeType: true,
  imageAltEn: true,
  imageCaptionEn: true,
  isActive: true,
  isFeatured: true,
  showOnRegionPage: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true} as const satisfies Prisma.RegionNumberPlateFormatSelect;

const adminSectionSelect = {
  id: true,
  regionId: true,
  sectionTitleEn: true,
  sectionDescEn: true,
  faqJson: true,
  isActive: true,
  showOnRegionPage: true,
  updatedAt: true} as const satisfies Prisma.RegionPlateFormatSectionSelect;

export type AdminRegionNumberPlateFormat = Prisma.RegionNumberPlateFormatGetPayload<{
  select: typeof adminFormatSelect;
}>;

export type AdminRegionPlateFormatSection = Prisma.RegionPlateFormatSectionGetPayload<{
  select: typeof adminSectionSelect;
}>;

export class AdminRegionPlateFormatRepository extends Repository {
  async findSectionByRegionId(regionId: string) {
    if (!isPlateFormatSchemaReady(this.db)) {
      return null;
    }

    return this.db.regionPlateFormatSection.findUnique({
      where: { regionId },
      select: adminSectionSelect});
  }

  async listFormatsByRegionId(regionId: string): Promise<AdminRegionNumberPlateFormat[]> {
    if (!isPlateFormatSchemaReady(this.db)) {
      return [];
    }

    return this.db.regionNumberPlateFormat.findMany({
      where: { regionId, deletedAt: null },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      select: adminFormatSelect});
  }

  async findFormatById(id: string) {
    if (!isPlateFormatSchemaReady(this.db)) {
      return null;
    }

    return this.db.regionNumberPlateFormat.findFirst({
      where: { id, deletedAt: null },
      select: adminFormatSelect});
  }
}

export const adminRegionPlateFormatRepository =
  new AdminRegionPlateFormatRepository();
