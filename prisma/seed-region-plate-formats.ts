import type { PrismaClient, VehiclePlateType } from "@prisma/client";

type RegionPlateSeed = {
  regionSlug: string;
  sectionTitleEn: string;
  sectionDescEn: string;
  formats: Array<{
    vehicleType: VehiclePlateType;
    titleEn: string;
    formats: string[];
    descriptionEn: string;
    relatedServiceSlugs: string[];
    displayOrder: number;
    isFeatured?: boolean;
  }>;
};

const PLATE_SEED: RegionPlateSeed[] = [
  {
    regionSlug: "punjab",
    sectionTitleEn: "Vehicle Number Plate Formats in Punjab",
    sectionDescEn:
      "Check common vehicle registration number formats used in Punjab. These examples help users enter the correct vehicle number when submitting token tax, e-challan, transfer, registration, or related service requests.",
    formats: [
      {
        vehicleType: "CAR",
        titleEn: "Punjab Car Number Plate Format",
        formats: ["ABC 123", "ABC 0123", "ABC 1111", "ABC-07-1111"],
        descriptionEn:
          "Use this format when entering your Punjab vehicle registration number for token tax, e-challan, transfer, or related vehicle services.",
        relatedServiceSlugs: ["token-tax-payment", "e-challan", "vehicle-transfer"],
        displayOrder: 1,
        isFeatured: true}]},
  {
    regionSlug: "islamabad",
    sectionTitleEn: "Vehicle Number Plate Formats in Islamabad ICT",
    sectionDescEn:
      "Check common vehicle registration number formats used in Islamabad ICT. These examples help users enter the correct vehicle number when submitting token tax, e-challan, transfer, registration, or related service requests.",
    formats: [
      {
        vehicleType: "CAR",
        titleEn: "Islamabad ICT Vehicle Number Plate Format",
        formats: ["ABC-123"],
        descriptionEn:
          "Use this format when entering your Islamabad ICT vehicle registration number for token tax, e-challan, transfer, or related vehicle services.",
        relatedServiceSlugs: ["token-tax-payment", "e-challan", "vehicle-transfer"],
        displayOrder: 1,
        isFeatured: true}]},
  {
    regionSlug: "sindh",
    sectionTitleEn: "Vehicle Number Plate Formats in Sindh",
    sectionDescEn:
      "Check common vehicle registration number formats used in Sindh for token tax, e-challan, transfer, and related vehicle service requests.",
    formats: [
      {
        vehicleType: "CAR",
        titleEn: "Sindh Car Number Plate Format",
        formats: ["ABC-123"],
        descriptionEn:
          "Use this format when entering your Sindh vehicle registration number for token tax, e-challan, or related vehicle services.",
        relatedServiceSlugs: ["token-tax-payment", "e-challan"],
        displayOrder: 1,
        isFeatured: true}]},
  {
    regionSlug: "balochistan",
    sectionTitleEn: "Vehicle Number Plate Formats in Balochistan",
    sectionDescEn:
      "Check common vehicle registration number formats used in Balochistan for token tax, e-challan, and related vehicle service requests.",
    formats: [
      {
        vehicleType: "CAR",
        titleEn: "Balochistan Car Number Plate Format",
        formats: ["ABC-123"],
        descriptionEn:
          "Use this format when entering your Balochistan vehicle registration number for token tax, e-challan, or related vehicle services.",
        relatedServiceSlugs: ["token-tax-payment", "e-challan"],
        displayOrder: 1,
        isFeatured: true}]},
  {
    regionSlug: "kpk",
    sectionTitleEn: "Vehicle Number Plate Formats in Khyber Pakhtunkhwa",
    sectionDescEn:
      "Check common vehicle registration number formats used in Khyber Pakhtunkhwa for token tax, e-challan, and related vehicle service requests.",
    formats: [
      {
        vehicleType: "CAR",
        titleEn: "Khyber Pakhtunkhwa Car Number Plate Format",
        formats: ["ABC-1234", "ABC-123"],
        descriptionEn:
          "Use this format when entering your Khyber Pakhtunkhwa vehicle registration number for token tax, e-challan, or related vehicle services.",
        relatedServiceSlugs: ["token-tax-payment", "e-challan"],
        displayOrder: 1,
        isFeatured: true}]},
  {
    regionSlug: "ajk",
    sectionTitleEn: "Vehicle Number Plate Formats in Azad Jammu & Kashmir",
    sectionDescEn:
      "Check common vehicle registration number formats used in Azad Jammu & Kashmir for e-challan and related vehicle service requests.",
    formats: [
      {
        vehicleType: "CAR",
        titleEn: "AJK Car Number Plate Format",
        formats: ["AA-BB-1234", "AB-123"],
        descriptionEn:
          "This format is commonly used for private vehicle registration numbers in Azad Jammu & Kashmir.",
        relatedServiceSlugs: ["e-challan"],
        displayOrder: 1,
        isFeatured: true}]},
  {
    regionSlug: "gilgit-baltistan",
    sectionTitleEn: "Vehicle Number Plate Formats in Gilgit-Baltistan",
    sectionDescEn:
      "Check common vehicle registration number formats used in Gilgit-Baltistan for e-challan and related vehicle service requests.",
    formats: [
      {
        vehicleType: "CAR",
        titleEn: "Gilgit-Baltistan Car Number Plate Format",
        formats: ["ABC-123"],
        descriptionEn:
          "Use this format when entering your Gilgit-Baltistan vehicle registration number for e-challan or related vehicle services.",
        relatedServiceSlugs: ["e-challan"],
        displayOrder: 1,
        isFeatured: true}]}];

export async function seedRegionPlateFormats(
  prisma: PrismaClient,
  regionMap: Record<string, string>,
): Promise<void> {
  for (const entry of PLATE_SEED) {
    const regionId = regionMap[entry.regionSlug];
    if (!regionId) {
      continue;
    }

    await prisma.regionPlateFormatSection.upsert({
      where: { regionId },
      update: {
        sectionTitleEn: entry.sectionTitleEn,
        sectionDescEn: entry.sectionDescEn,
        isActive: true,
        showOnRegionPage: true},
      create: {
        regionId,
        sectionTitleEn: entry.sectionTitleEn,
        sectionDescEn: entry.sectionDescEn,
        isActive: true,
        showOnRegionPage: true}});

    for (const format of entry.formats) {
      const existing = await prisma.regionNumberPlateFormat.findFirst({
        where: {
          regionId,
          vehicleType: format.vehicleType,
          titleEn: format.titleEn,
          deletedAt: null}});

      const data = {
        regionId,
        vehicleType: format.vehicleType,
        titleEn: format.titleEn,
        formatsJson: format.formats,
        descriptionEn: format.descriptionEn,
        relatedServiceSlugs: format.relatedServiceSlugs,
        isActive: true,
        isFeatured: format.isFeatured ?? false,
        showOnRegionPage: true,
        displayOrder: format.displayOrder};

      if (existing) {
        await prisma.regionNumberPlateFormat.update({
          where: { id: existing.id },
          data});
      } else {
        await prisma.regionNumberPlateFormat.create({ data });
      }
    }
  }
}
