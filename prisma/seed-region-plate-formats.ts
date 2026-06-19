import type { PrismaClient, VehiclePlateType } from "@prisma/client";

type RegionPlateSeed = {
  regionSlug: string;
  sectionTitleEn: string;
  sectionTitleUr: string;
  sectionDescEn: string;
  sectionDescUr: string;
  formats: Array<{
    vehicleType: VehiclePlateType;
    titleEn: string;
    titleUr: string;
    formats: string[];
    descriptionEn: string;
    descriptionUr: string;
    relatedServiceSlugs: string[];
    displayOrder: number;
    isFeatured?: boolean;
  }>;
};

const PLATE_SEED: RegionPlateSeed[] = [
  {
    regionSlug: "punjab",
    sectionTitleEn: "Vehicle Number Plate Formats in Punjab",
    sectionTitleUr: "پنجاب میں گاڑی نمبر پلیٹ فارمیٹس",
    sectionDescEn:
      "Check common vehicle registration number formats used in Punjab. These examples help users enter the correct vehicle number when submitting token tax, e-challan, transfer, registration, or related service requests.",
    sectionDescUr:
      "پنجاب میں استعمال ہونے والے عام گاڑی رجسٹریشن نمبر فارمیٹس دیکھیں۔ یہ مثالیں ٹوکن ٹیکس، ای چالان، منتقلی، رجسٹریشن یا متعلقہ سروس درخواست جمع کرتے وقت درست گاڑی نمبر درج کرنے میں مدد کرتی ہیں۔",
    formats: [
      {
        vehicleType: "CAR",
        titleEn: "Punjab Car Number Plate Format",
        titleUr: "پنجاب کار نمبر پلیٹ فارمیٹ",
        formats: ["ABC 123", "ABC 0123", "ABC 1111", "ABC-07-1111"],
        descriptionEn:
          "Use this format when entering your Punjab vehicle registration number for token tax, e-challan, transfer, or related vehicle services.",
        descriptionUr:
          "ٹوکن ٹیکس، ای چالان، منتقلی یا متعلقہ گاڑی سروسز کے لیے پنجاب کا گاڑی رجسٹریشن نمبر درج کرتے وقت یہ فارمیٹ استعمال کریں۔",
        relatedServiceSlugs: ["token-tax-payment", "e-challan", "vehicle-transfer"],
        displayOrder: 1,
        isFeatured: true,
      },
    ],
  },
  {
    regionSlug: "islamabad",
    sectionTitleEn: "Vehicle Number Plate Formats in Islamabad ICT",
    sectionTitleUr: "اسلام آباد ICT میں گاڑی نمبر پلیٹ فارمیٹس",
    sectionDescEn:
      "Check common vehicle registration number formats used in Islamabad ICT. These examples help users enter the correct vehicle number when submitting token tax, e-challan, transfer, registration, or related service requests.",
    sectionDescUr:
      "اسلام آباد ICT میں استعمال ہونے والے عام گاڑی رجسٹریشن نمبر فارمیٹس دیکھیں۔",
    formats: [
      {
        vehicleType: "CAR",
        titleEn: "Islamabad ICT Vehicle Number Plate Format",
        titleUr: "اسلام آباد ICT گاڑی نمبر پلیٹ فارمیٹ",
        formats: ["ABC-123"],
        descriptionEn:
          "Use this format when entering your Islamabad ICT vehicle registration number for token tax, e-challan, transfer, or related vehicle services.",
        descriptionUr:
          "اسلام آباد ICT گاڑی رجسٹریشن نمبر درج کرتے وقت یہ فارمیٹ استعمال کریں۔",
        relatedServiceSlugs: ["token-tax-payment", "e-challan", "vehicle-transfer"],
        displayOrder: 1,
        isFeatured: true,
      },
    ],
  },
  {
    regionSlug: "sindh",
    sectionTitleEn: "Vehicle Number Plate Formats in Sindh",
    sectionTitleUr: "سندھ میں گاڑی نمبر پلیٹ فارمیٹس",
    sectionDescEn:
      "Check common vehicle registration number formats used in Sindh for token tax, e-challan, transfer, and related vehicle service requests.",
    sectionDescUr:
      "سندھ میں ٹوکن ٹیکس، ای چالان، منتقلی اور متعلقہ سروسز کے لیے عام گاڑی رجسٹریشن فارمیٹس۔",
    formats: [
      {
        vehicleType: "CAR",
        titleEn: "Sindh Car Number Plate Format",
        titleUr: "سندھ کار نمبر پلیٹ فارمیٹ",
        formats: ["ABC-123"],
        descriptionEn:
          "Use this format when entering your Sindh vehicle registration number for token tax, e-challan, or related vehicle services.",
        descriptionUr: "سندھ گاڑی رجسٹریشن نمبر کے لیے یہ فارمیٹ استعمال کریں۔",
        relatedServiceSlugs: ["token-tax-payment", "e-challan"],
        displayOrder: 1,
        isFeatured: true,
      },
    ],
  },
  {
    regionSlug: "balochistan",
    sectionTitleEn: "Vehicle Number Plate Formats in Balochistan",
    sectionTitleUr: "بلوچستان میں گاڑی نمبر پلیٹ فارمیٹس",
    sectionDescEn:
      "Check common vehicle registration number formats used in Balochistan for token tax, e-challan, and related vehicle service requests.",
    sectionDescUr:
      "بلوچستان میں ٹوکن ٹیکس، ای چالان اور متعلقہ سروسز کے لیے عام گاڑی رجسٹریشن فارمیٹس۔",
    formats: [
      {
        vehicleType: "CAR",
        titleEn: "Balochistan Car Number Plate Format",
        titleUr: "بلوچستان کار نمبر پلیٹ فارمیٹ",
        formats: ["ABC-123"],
        descriptionEn:
          "Use this format when entering your Balochistan vehicle registration number for token tax, e-challan, or related vehicle services.",
        descriptionUr: "بلوچستان گاڑی رجسٹریشن نمبر کے لیے یہ فارمیٹ استعمال کریں۔",
        relatedServiceSlugs: ["token-tax-payment", "e-challan"],
        displayOrder: 1,
        isFeatured: true,
      },
    ],
  },
  {
    regionSlug: "kpk",
    sectionTitleEn: "Vehicle Number Plate Formats in Khyber Pakhtunkhwa",
    sectionTitleUr: "خیبر پختونخوا میں گاڑی نمبر پلیٹ فارمیٹس",
    sectionDescEn:
      "Check common vehicle registration number formats used in Khyber Pakhtunkhwa for token tax, e-challan, and related vehicle service requests.",
    sectionDescUr:
      "خیبر پختونخوا میں ٹوکن ٹیکس، ای چالان اور متعلقہ سروسز کے لیے عام گاڑی رجسٹریشن فارمیٹس۔",
    formats: [
      {
        vehicleType: "CAR",
        titleEn: "Khyber Pakhtunkhwa Car Number Plate Format",
        titleUr: "خیبر پختونخوا کار نمبر پلیٹ فارمیٹ",
        formats: ["ABC-1234", "ABC-123"],
        descriptionEn:
          "Use this format when entering your Khyber Pakhtunkhwa vehicle registration number for token tax, e-challan, or related vehicle services.",
        descriptionUr:
          "خیبر پختونخوا گاڑی رجسٹریشن نمبر کے لیے یہ فارمیٹ استعمال کریں۔",
        relatedServiceSlugs: ["token-tax-payment", "e-challan"],
        displayOrder: 1,
        isFeatured: true,
      },
    ],
  },
  {
    regionSlug: "ajk",
    sectionTitleEn: "Vehicle Number Plate Formats in Azad Jammu & Kashmir",
    sectionTitleUr: "آزاد جموں و کشمیر میں گاڑی نمبر پلیٹ فارمیٹس",
    sectionDescEn:
      "Check common vehicle registration number formats used in Azad Jammu & Kashmir for e-challan and related vehicle service requests.",
    sectionDescUr:
      "آزاد جموں و کشمیر میں ای چالان اور متعلقہ سروسز کے لیے عام گاڑی رجسٹریشن فارمیٹس۔",
    formats: [
      {
        vehicleType: "CAR",
        titleEn: "AJK Car Number Plate Format",
        titleUr: "آزاد کشمیر کار نمبر پلیٹ فارمیٹ",
        formats: ["AA-BB-1234", "AB-123"],
        descriptionEn:
          "This format is commonly used for private vehicle registration numbers in Azad Jammu & Kashmir.",
        descriptionUr:
          "یہ فارمیٹ آزاد جموں و کشمیر میں نجی گاڑی رجسٹریشن نمبروں کے لیے عام طور پر استعمال ہوتا ہے۔",
        relatedServiceSlugs: ["e-challan"],
        displayOrder: 1,
        isFeatured: true,
      },
    ],
  },
  {
    regionSlug: "gilgit-baltistan",
    sectionTitleEn: "Vehicle Number Plate Formats in Gilgit-Baltistan",
    sectionTitleUr: "گلگت بلتستان میں گاڑی نمبر پلیٹ فارمیٹس",
    sectionDescEn:
      "Check common vehicle registration number formats used in Gilgit-Baltistan for e-challan and related vehicle service requests.",
    sectionDescUr:
      "گلگت بلتستان میں ای چالان اور متعلقہ سروسز کے لیے عام گاڑی رجسٹریشن فارمیٹس۔",
    formats: [
      {
        vehicleType: "CAR",
        titleEn: "Gilgit-Baltistan Car Number Plate Format",
        titleUr: "گلگت بلتستان کار نمبر پلیٹ فارمیٹ",
        formats: ["ABC-123"],
        descriptionEn:
          "Use this format when entering your Gilgit-Baltistan vehicle registration number for e-challan or related vehicle services.",
        descriptionUr:
          "گلگت بلتستان گاڑی رجسٹریشن نمبر کے لیے یہ فارمیٹ استعمال کریں۔",
        relatedServiceSlugs: ["e-challan"],
        displayOrder: 1,
        isFeatured: true,
      },
    ],
  },
];

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
        sectionTitleUr: entry.sectionTitleUr,
        sectionDescEn: entry.sectionDescEn,
        sectionDescUr: entry.sectionDescUr,
        isActive: true,
        showOnRegionPage: true,
      },
      create: {
        regionId,
        sectionTitleEn: entry.sectionTitleEn,
        sectionTitleUr: entry.sectionTitleUr,
        sectionDescEn: entry.sectionDescEn,
        sectionDescUr: entry.sectionDescUr,
        isActive: true,
        showOnRegionPage: true,
      },
    });

    for (const format of entry.formats) {
      const existing = await prisma.regionNumberPlateFormat.findFirst({
        where: {
          regionId,
          vehicleType: format.vehicleType,
          titleEn: format.titleEn,
          deletedAt: null,
        },
      });

      const data = {
        regionId,
        vehicleType: format.vehicleType,
        titleEn: format.titleEn,
        titleUr: format.titleUr,
        formatsJson: format.formats,
        descriptionEn: format.descriptionEn,
        descriptionUr: format.descriptionUr,
        relatedServiceSlugs: format.relatedServiceSlugs,
        isActive: true,
        isFeatured: format.isFeatured ?? false,
        showOnRegionPage: true,
        displayOrder: format.displayOrder,
      };

      if (existing) {
        await prisma.regionNumberPlateFormat.update({
          where: { id: existing.id },
          data,
        });
      } else {
        await prisma.regionNumberPlateFormat.create({ data });
      }
    }
  }
}
