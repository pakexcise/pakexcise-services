import type { PrismaClient } from "@prisma/client";

import { REGION_SLUG_ALIASES } from "../config/region-slugs";
import { CITY_SEED } from "./seed-cities-data";
import { seedServiceConfig } from "./seed-service-config";
import { seedRegionPlateFormats } from "./seed-region-plate-formats";
import { seedLegalPages } from "./seed-legal-pages";
import { seedBlogCategories } from "./seed-blog-categories";
import {
  PRIMARY_BLOG_CATEGORY_SLUG,
  PRIMARY_BLOG_SUBCATEGORY_SLUG,
} from "./blog-category-seed";
import {
  PRIMARY_BLOG_CONTENT_EN,
  PRIMARY_BLOG_CONTENT_FAQS,
  PRIMARY_BLOG_RELATED_SERVICE_SLUGS,
  PRIMARY_BLOG_SEED,
  PRIMARY_BLOG_SLUG,
} from "./primary-blog-seed";

const DEFAULT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const PRIVATE_DISCLAIMER_EN =
  "PakExcise.com is a private facilitation service and is not affiliated with Excise & Taxation, MTMIS, NADRA, ICT Excise, or any Government of Pakistan body.";
const PRIVATE_DISCLAIMER_UR =
  "PakExcise.com ایک نجی سہولت سروس ہے اور ایکسائز و ٹیکسیشن، MTMIS، NADRA، ICT Excise یا حکومت پاکستان کے کسی بھی ادارے سے وابستہ نہیں ہے۔";

export const REGION_SEED = [
  {
    slug: "punjab",
    nameEn: "Punjab",
    nameUr: "پنجاب",
    descriptionEn:
      "Private excise facilitation support for vehicle and license services across Punjab province.",
    descriptionUr: "پنجاب صوبے میں گاڑی اور لائسنس سروسز کے لیے نجی ایکسائز سہولت۔",
    displayOrder: 1,
  },
  {
    slug: "sindh",
    nameEn: "Sindh",
    nameUr: "سندھ",
    descriptionEn:
      "Private facilitation guidance for excise-related processes in Sindh province.",
    descriptionUr: "سندھ صوبے میں ایکسائز سے متعلق عمل کے لیے نجی رہنمائی۔",
    displayOrder: 2,
  },
  {
    slug: "kpk",
    nameEn: "Khyber Pakhtunkhwa",
    nameUr: "خیبر پختونخوا",
    descriptionEn:
      "Private facilitation support for excise services in Khyber Pakhtunkhwa.",
    descriptionUr: "خیبر پختونخوا میں ایکسائز سروسز کے لیے نجی سہولت۔",
    displayOrder: 3,
  },
  {
    slug: "balochistan",
    nameEn: "Balochistan",
    nameUr: "بلوچستان",
    descriptionEn:
      "Private facilitation support for excise services in Balochistan.",
    descriptionUr: "بلوچستان میں ایکسائز سروسز کے لیے نجی سہولت۔",
    displayOrder: 4,
  },
  {
    slug: "islamabad",
    nameEn: "Islamabad ICT",
    nameUr: "اسلام آباد ICT",
    descriptionEn:
      "Private excise facilitation for Islamabad Capital Territory services.",
    descriptionUr: "اسلام آباد دارالحکومت کی ایکسائز سروسز کے لیے نجی سہولت۔",
    displayOrder: 5,
  },
  {
    slug: "gilgit-baltistan",
    nameEn: "Gilgit-Baltistan",
    nameUr: "گلگت بلتستان",
    descriptionEn:
      "Private facilitation guidance for excise-related processes in Gilgit-Baltistan.",
    descriptionUr: "گلگت بلتستان میں ایکسائز سے متعلق عمل کے لیے نجی رہنمائی۔",
    displayOrder: 6,
  },
  {
    slug: "ajk",
    nameEn: "Azad Jammu & Kashmir",
    nameUr: "آزاد جموں و کشمیر",
    descriptionEn:
      "Private facilitation guidance for excise-related processes in Azad Kashmir.",
    descriptionUr: "آزاد کشمیر میں ایکسائز سے متعلق عمل کے لیے نجی رہنمائی۔",
    displayOrder: 7,
  },
] as const;

const LEGACY_REGION_MIGRATIONS = Object.entries(REGION_SLUG_ALIASES).map(
  ([legacySlug, canonicalSlug]) => ({ legacySlug, canonicalSlug }),
);

async function migrateLegacyRegions(
  prisma: PrismaClient,
  regionMap: Record<string, string>,
): Promise<void> {
  for (const { legacySlug, canonicalSlug } of LEGACY_REGION_MIGRATIONS) {
    const legacyRegion = await prisma.region.findUnique({
      where: { slug: legacySlug },
      select: { id: true },
    });
    const canonicalRegionId = regionMap[canonicalSlug];

    if (!legacyRegion || !canonicalRegionId) {
      continue;
    }

    const legacyCities = await prisma.city.findMany({
      where: { regionId: legacyRegion.id },
      select: { id: true, slug: true },
    });

    for (const city of legacyCities) {
      const existingCity = await prisma.city.findFirst({
        where: { regionId: canonicalRegionId, slug: city.slug },
        select: { id: true },
      });

      if (existingCity) {
        await prisma.city.update({
          where: { id: city.id },
          data: { isActive: false, deletedAt: new Date() },
        });
      } else {
        await prisma.city.update({
          where: { id: city.id },
          data: { regionId: canonicalRegionId, isActive: true, deletedAt: null },
        });
      }
    }

    const legacyAssignments = await prisma.serviceRegion.findMany({
      where: { regionId: legacyRegion.id },
    });

    for (const assignment of legacyAssignments) {
      const existingAssignment = await prisma.serviceRegion.findFirst({
        where: {
          serviceId: assignment.serviceId,
          regionId: canonicalRegionId,
        },
      });

      if (!existingAssignment) {
        await prisma.serviceRegion.create({
          data: {
            serviceId: assignment.serviceId,
            regionId: canonicalRegionId,
            displayOrder: assignment.displayOrder,
            isActive: true,
          },
        });
      }

      await prisma.serviceRegion.delete({ where: { id: assignment.id } });
    }

    await prisma.region.update({
      where: { id: legacyRegion.id },
      data: { isActive: false, deletedAt: new Date() },
    });
  }
}

export const CATEGORY_SEED = [
  {
    slug: "vehicle-services",
    nameEn: "Vehicle Services",
    nameUr: "گاڑی کی خدمات",
    descriptionEn:
      "Private facilitation for vehicle transfer, registration, token tax, route permits, and related excise support.",
    descriptionUr:
      "گاڑی منتقلی، رجسٹریشن، ٹوکن ٹیکس، راؤٹ پرمٹ اور متعلقہ ایکسائز سہولت۔",
    displayOrder: 1,
  },
  {
    slug: "license-services",
    nameEn: "License Services",
    nameUr: "لائسنس کی خدمات",
    descriptionEn:
      "Private facilitation for driving license renewal and learner license applications.",
    descriptionUr:
      "ڈرائیونگ لائسنس تجدید اور لرنر لائسنس درخواستوں کے لیے نجی سہولت۔",
    displayOrder: 2,
  },
  {
    slug: "e-challan-safe-city",
    nameEn: "E-Challan / Safe City",
    nameUr: "ای چالان / سیف سٹی",
    descriptionEn:
      "Private guidance for e-challan and Safe City-related facilitation across Pakistan.",
    descriptionUr:
      "پاکستان بھر میں ای چالان اور سیف سٹی سے متعلق نجی رہنمائی۔",
    displayOrder: 3,
  },
] as const;

const LEGACY_CATEGORY_SLUGS = [
  "vehicle-transfer",
  "registration",
  "token-tax",
  "inspection",
  "route-permit",
  "license",
  "data-correction",
] as const;

const ALL_REGION_SLUGS = [
  "punjab",
  "sindh",
  "kpk",
  "balochistan",
  "islamabad",
  "gilgit-baltistan",
  "ajk",
] as const;

const TOKEN_TAX_REGION_SLUGS = [
  "punjab",
  "islamabad",
  "sindh",
  "balochistan",
  "kpk",
] as const;

export const SERVICE_SEED = [
  {
    slug: "vehicle-transfer",
    regionSlugs: ["punjab", "islamabad"],
    categorySlug: "vehicle-services",
    nameEn: "Vehicle Transfer",
    nameUr: "گاڑی منتقلی",
    shortDescriptionEn:
      "Private facilitation for vehicle ownership transfer in Punjab and Islamabad ICT.",
    shortDescriptionUr:
      "پنجاب اور اسلام آباد ICT میں گاڑی کی ملکیت منتقلی کے لیے نجی سہولت۔",
    displayOrder: 1,
  },
  {
    slug: "token-tax-payment",
    regionSlugs: TOKEN_TAX_REGION_SLUGS,
    categorySlug: "vehicle-services",
    nameEn: "Token Tax Payment",
    nameUr: "ٹوکن ٹیکس ادائیگی",
    shortDescriptionEn:
      "Private facilitation support for token tax payment across supported provinces.",
    shortDescriptionUr:
      "معاون صوبوں میں ٹوکن ٹیکس ادائیگی کے لیے نجی سہولت سپورٹ۔",
    displayOrder: 2,
  },
  {
    slug: "new-vehicle-registration",
    regionSlugs: ["punjab", "islamabad"],
    categorySlug: "vehicle-services",
    nameEn: "New Vehicle Registration",
    nameUr: "نئی گاڑی رجسٹریشن",
    shortDescriptionEn:
      "Private facilitation for new vehicle registration in Punjab and Islamabad ICT.",
    shortDescriptionUr:
      "پنجاب اور اسلام آباد ICT میں نئی گاڑی رجسٹریشن کے لیے نجی سہولت۔",
    displayOrder: 3,
  },
  {
    slug: "vehicle-passing-fitness",
    regionSlugs: ["islamabad"],
    categorySlug: "vehicle-services",
    nameEn: "Vehicle Passing / Fitness",
    nameUr: "گاڑی پاسنگ / فٹنس",
    shortDescriptionEn:
      "Private facilitation for vehicle passing and fitness processes in Islamabad ICT.",
    shortDescriptionUr:
      "اسلام آباد ICT میں گاڑی پاسنگ اور فٹنس کے عمل کے لیے نجی سہولت۔",
    displayOrder: 4,
  },
  {
    slug: "route-permit",
    regionSlugs: ["punjab", "islamabad"],
    categorySlug: "vehicle-services",
    nameEn: "Route Permit",
    nameUr: "راؤٹ پرمٹ",
    shortDescriptionEn:
      "Private facilitation for route permit services in Punjab and Islamabad ICT.",
    shortDescriptionUr:
      "پنجاب اور اسلام آباد ICT میں راؤٹ پرمٹ سروسز کے لیے نجی سہولت۔",
    displayOrder: 5,
  },
  {
    slug: "route-permit-new",
    parentSlug: "route-permit",
    regionSlugs: ["punjab"],
    categorySlug: "vehicle-services",
    nameEn: "New Route Permit",
    nameUr: "نیا راؤٹ پرمٹ",
    shortDescriptionEn: "Private facilitation for new route permit applications.",
    shortDescriptionUr: "نئے راؤٹ پرمٹ درخواستوں کے لیے نجی سہولت۔",
    displayOrder: 1,
  },
  {
    slug: "route-permit-noc",
    parentSlug: "route-permit",
    regionSlugs: ["punjab"],
    categorySlug: "vehicle-services",
    nameEn: "Route Permit NOC",
    nameUr: "راؤٹ پرمٹ NOC",
    shortDescriptionEn: "Private facilitation for route permit NOC requests.",
    shortDescriptionUr: "راؤٹ پرمٹ NOC درخواستوں کے لیے نجی سہولت۔",
    displayOrder: 2,
  },
  {
    slug: "route-permit-duplicate",
    parentSlug: "route-permit",
    regionSlugs: ["punjab"],
    categorySlug: "vehicle-services",
    nameEn: "Route Permit Duplicate",
    nameUr: "راؤٹ پرمٹ ڈپلیکیٹ",
    shortDescriptionEn:
      "Private facilitation for duplicate route permit applications.",
    shortDescriptionUr: "ڈپلیکیٹ راؤٹ پرمٹ درخواستوں کے لیے نجی سہولت۔",
    displayOrder: 3,
  },
  {
    slug: "vehicle-data-correction",
    regionSlugs: ["punjab", "islamabad"],
    categorySlug: "vehicle-services",
    nameEn: "Data Correction",
    nameUr: "ڈیٹا تصحیح",
    shortDescriptionEn:
      "Private facilitation for excise record data correction in Punjab and Islamabad ICT.",
    shortDescriptionUr:
      "پنجاب اور اسلام آباد ICT میں ایکسائز ریکارڈ تصحیح کے لیے نجی سہولت۔",
    displayOrder: 6,
  },
  {
    slug: "driving-license-renewal",
    regionSlugs: ["punjab"],
    categorySlug: "license-services",
    nameEn: "Driving License Renewal",
    nameUr: "ڈرائیونگ لائسنس تجدید",
    shortDescriptionEn:
      "Private facilitation for driving license renewal in Punjab.",
    shortDescriptionUr: "پنجاب میں ڈرائیونگ لائسنس تجدید کے لیے نجی سہولت۔",
    displayOrder: 1,
  },
  {
    slug: "learner-license",
    regionSlugs: ["punjab", "islamabad"],
    categorySlug: "license-services",
    nameEn: "Learner's License",
    nameUr: "لرنر لائسنس",
    shortDescriptionEn:
      "Private facilitation for learner license applications in Punjab and Islamabad ICT.",
    shortDescriptionUr:
      "پنجاب اور اسلام آباد ICT میں لرنر لائسنس درخواستوں کے لیے نجی سہولت۔",
    displayOrder: 2,
  },
  {
    slug: "e-challan",
    regionSlugs: ALL_REGION_SLUGS,
    categorySlug: "e-challan-safe-city",
    nameEn: "E-Challan",
    nameUr: "ای چالان",
    shortDescriptionEn:
      "Private facilitation guidance for e-challan support across Pakistan provinces.",
    shortDescriptionUr:
      "پاکستان کے صوبوں میں ای چالان سپورٹ کے لیے نجی سہولت رہنمائی۔",
    displayOrder: 1,
  },
] as const;

export const BLOG_SEED = [] as const;

export const PAYMENT_METHOD_SEED = [
  {
    code: "meezan-bank",
    type: "BANK_TRANSFER" as const,
    nameEn: "Meezan Bank",
    nameUr: "میزان بینک",
    accountTitleEn: "RASHID SHAHBAZ SHARIF",
    accountTitleUr: "راشد شہباز شریف",
    accountNumber: "03300111833629",
    iban: "PK30MEZN0003300111833629",
    bankNameEn: "Meezan Bank",
    bankNameUr: "میزان بینک",
    instructionsEn: null,
    instructionsUr: null,
    displayOrder: 1,
  },
  {
    code: "easypaisa",
    type: "EASYPAISA" as const,
    nameEn: "Easypaisa",
    nameUr: "ایزی پیسہ",
    accountTitleEn: "Rashid Shahbaz Sharif",
    accountTitleUr: "راشد شہباز شریف",
    accountNumber: "03413110094",
    iban: null,
    bankNameEn: null,
    bankNameUr: null,
    instructionsEn: null,
    instructionsUr: null,
    displayOrder: 2,
  },
] as const;

export const SOCIAL_SEED = [
  {
    platform: "facebook",
    labelEn: "Facebook",
    labelUr: "فیس بک",
    url: "https://www.facebook.com/pakexcise/",
    iconName: "facebook",
    displayOrder: 1,
  },
  {
    platform: "instagram",
    labelEn: "Instagram",
    labelUr: "انسٹاگرام",
    url: "https://www.instagram.com/pakexcise/",
    iconName: "instagram",
    displayOrder: 2,
  },
  {
    platform: "tiktok",
    labelEn: "TikTok",
    labelUr: "ٹک ٹاک",
    url: "https://www.tiktok.com/@pakexcise",
    iconName: "tiktok",
    displayOrder: 3,
  },
  {
    platform: "youtube",
    labelEn: "YouTube",
    labelUr: "یوٹیوب",
    url: "https://www.youtube.com/@PakExcise",
    iconName: "youtube",
    displayOrder: 4,
  },
  {
    platform: "linkedin",
    labelEn: "LinkedIn",
    labelUr: "لنکڈ ان",
    url: "https://www.linkedin.com/in/pakexcise/",
    iconName: "linkedin",
    displayOrder: 5,
  },
  {
    platform: "x",
    labelEn: "X (Twitter)",
    labelUr: "ایکس (ٹویٹر)",
    url: "https://x.com/pakexcise",
    iconName: "x",
    displayOrder: 6,
  },
] as const;

export const REVIEW_SEED = [
  {
    authorNameEn: "Ahmed R.",
    authorNameUr: "احمد ر.",
    authorRoleEn: "Vehicle transfer customer",
    authorRoleUr: "گاڑی منتقلی گاہک",
    contentEn:
      "PakExcise helped me organize documents and track my application without confusion. Clear private service — not government.",
    contentUr:
      "PakExcise نے دستاویزات منظم کرنے اور درخواست ٹریک کرنے میں مدد کی۔ واضح نجی سروس — سرکاری نہیں۔",
    rating: 5,
    displayOrder: 1,
  },
  {
    authorNameEn: "Sana K.",
    authorNameUr: "ثنا ک.",
    authorRoleEn: "Token tax facilitation",
    authorRoleUr: "ٹوکن ٹیکس سہولت",
    contentEn:
      "Responsive WhatsApp support and step-by-step guidance. Fees were only shared on invoice after review.",
    contentUr:
      "فوری واٹس ایپ سپورٹ اور مرحلہ وار رہنمائی۔ فیس صرف جائزے کے بعد انوائس پر شیئر ہوئی۔",
    rating: 5,
    displayOrder: 2,
  },
  {
    authorNameEn: "Bilal H.",
    authorNameUr: "بلال ح.",
    authorRoleEn: "New registration customer",
    authorRoleUr: "نئی رجسٹریشن گاہک",
    contentEn:
      "Professional experience from application to completion proof download.",
    contentUr:
      "درخواست سے لے کر تکمیل ثبوت ڈاؤن لوڈ تک پیشہ ورانہ تجربہ۔",
    rating: 5,
    displayOrder: 3,
  },
] as const;

function serviceContent(shortEn: string, shortUr: string) {
  return {
    contentEn: `${shortEn}\n\n## Overview\nOur team helps you prepare documents, submit your application, and track progress through a private facilitation service.\n\n## Why choose PakExcise\n- Dedicated support via WhatsApp and dashboard\n- Document checklist guidance\n- Status tracking with notes on every update`,
    contentUr: `${shortUr}\n\n## جائزہ\nہماری ٹیم دستاویزات تیار کرنے، درخواست جمع کرانے اور پیش رفت ٹریک کرنے میں مدد کرتی ہے۔\n\n## PakExcise کیوں\n- واٹس ایپ اور ڈیش بورڈ کے ذریعے سپورٹ\n- دستاویزات چیک لسٹ رہنمائی\n- ہر اپڈیٹ پر نوٹس کے ساتھ ٹریکنگ`,
    processingNotesEn: null,
    processingNotesUr: null,
  };
}


export async function seedMarketingData(prisma: PrismaClient): Promise<void> {
  console.log("Seeding marketing content...");

  for (const region of REGION_SEED) {
    await prisma.region.upsert({
      where: { slug: region.slug },
      update: {
        nameEn: region.nameEn,
        nameUr: region.nameUr,
        descriptionEn: region.descriptionEn,
        descriptionUr: region.descriptionUr,
        displayOrder: region.displayOrder,
        footerDisplayOrder: region.displayOrder,
        showInFooter: true,
        isActive: true,
      },
      create: { ...region, isActive: true, showInFooter: true, footerDisplayOrder: region.displayOrder },
    });
  }

  const regionMap = Object.fromEntries(
    (await prisma.region.findMany({ select: { id: true, slug: true } })).map(
      (r) => [r.slug, r.id],
    ),
  );

  await migrateLegacyRegions(prisma, regionMap);

  for (const [regionSlug, cities] of Object.entries(CITY_SEED)) {
    const regionId = regionMap[regionSlug];
    if (!regionId) continue;

    for (const city of cities) {
      const created = await prisma.city.upsert({
        where: { regionId_slug: { regionId, slug: city.slug } },
        update: {
          nameEn: city.nameEn,
          nameUr: city.nameUr,
          descriptionEn: city.descriptionEn,
          descriptionUr: city.descriptionUr,
          displayOrder: city.displayOrder,
          isActive: true,
        },
        create: { ...city, regionId, isActive: true },
      });

      await prisma.seoMeta.upsert({
        where: { pageKey: `city:${regionSlug}:${city.slug}` },
        update: {
          cityId: created.id,
          metaTitleEn: `${city.nameEn} Excise Services | PakExcise.com`,
          metaTitleUr: `${city.nameUr} ایکسائز خدمات | PakExcise.com`,
          metaDescriptionEn: city.descriptionEn,
          metaDescriptionUr: city.descriptionUr,
          h1En: city.nameEn,
          h1Ur: city.nameUr,
        },
        create: {
          pageKey: `city:${regionSlug}:${city.slug}`,
          cityId: created.id,
          metaTitleEn: `${city.nameEn} Excise Services | PakExcise.com`,
          metaTitleUr: `${city.nameUr} ایکسائز خدمات | PakExcise.com`,
          metaDescriptionEn: city.descriptionEn,
          metaDescriptionUr: city.descriptionUr,
          h1En: city.nameEn,
          h1Ur: city.nameUr,
        },
      });
    }
  }

  for (const region of REGION_SEED) {
    const regionId = regionMap[region.slug];
    if (!regionId) continue;

    await prisma.seoMeta.upsert({
      where: { pageKey: `region:${region.slug}` },
      update: {
        regionId,
        metaTitleEn: `${region.nameEn} Services | PakExcise.com`,
        metaTitleUr: `${region.nameUr} خدمات | PakExcise.com`,
        metaDescriptionEn: region.descriptionEn,
        metaDescriptionUr: region.descriptionUr,
        h1En: region.nameEn,
        h1Ur: region.nameUr,
      },
      create: {
        pageKey: `region:${region.slug}`,
        regionId,
        metaTitleEn: `${region.nameEn} Services | PakExcise.com`,
        metaTitleUr: `${region.nameUr} خدمات | PakExcise.com`,
        metaDescriptionEn: region.descriptionEn,
        metaDescriptionUr: region.descriptionUr,
        h1En: region.nameEn,
        h1Ur: region.nameUr,
      },
    });
  }

  const categoryMap: Record<string, string> = {};
  for (const category of CATEGORY_SEED) {
    const created = await prisma.serviceCategory.upsert({
      where: { slug: category.slug },
      update: {
        nameEn: category.nameEn,
        nameUr: category.nameUr,
        descriptionEn: category.descriptionEn,
        descriptionUr: category.descriptionUr,
        displayOrder: category.displayOrder,
        isActive: true,
      },
      create: { ...category, isActive: true },
    });
    categoryMap[category.slug] = created.id;
  }

  await prisma.serviceCategory.updateMany({
    where: { slug: { in: [...LEGACY_CATEGORY_SLUGS] } },
    data: { isActive: false },
  });

  const serviceMap: Record<string, string> = {};

  for (const service of SERVICE_SEED) {
    const assignedRegionIds = service.regionSlugs
      .map((slug) => regionMap[slug])
      .filter((id): id is string => Boolean(id));
    const categoryId = categoryMap[service.categorySlug];
    const parentServiceId =
      "parentSlug" in service && service.parentSlug
        ? serviceMap[service.parentSlug]
        : null;

    if (assignedRegionIds.length === 0) continue;

    const primaryRegionId = assignedRegionIds[0];
    const content = serviceContent(
      service.shortDescriptionEn,
      service.shortDescriptionUr,
    );

    const created = await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        regionId: primaryRegionId,
        categoryId,
        parentServiceId,
        nameEn: service.nameEn,
        nameUr: service.nameUr,
        shortDescriptionEn: service.shortDescriptionEn,
        shortDescriptionUr: service.shortDescriptionUr,
        ...content,
        displayOrder: service.displayOrder,
        isActive: true,
      },
      create: {
        slug: service.slug,
        regionId: primaryRegionId,
        categoryId,
        parentServiceId,
        nameEn: service.nameEn,
        nameUr: service.nameUr,
        shortDescriptionEn: service.shortDescriptionEn,
        shortDescriptionUr: service.shortDescriptionUr,
        ...content,
        displayOrder: service.displayOrder,
        isActive: true,
        requiresProof: true,
      },
    });

    serviceMap[service.slug] = created.id;

    await prisma.serviceRegion.deleteMany({
      where: { serviceId: created.id },
    });
    await prisma.serviceRegion.createMany({
      data: assignedRegionIds.map((regionId, index) => ({
        serviceId: created.id,
        regionId,
        displayOrder: index,
        isActive: true,
      })),
    });

    await prisma.serviceFormField.upsert({
      where: {
        serviceId_fieldKey: {
          serviceId: created.id,
          fieldKey: "applicant_name",
        },
      },
      update: { isActive: true },
      create: {
        serviceId: created.id,
        fieldKey: "applicant_name",
        labelEn: "Applicant full name",
        labelUr: "درخواست دہندہ کا مکمل نام",
        fieldType: "TEXT",
        isRequired: true,
        displayOrder: 1,
      },
    });

    const existingDoc = await prisma.documentRequirement.findFirst({
      where: {
        serviceId: created.id,
        docType: "cnic_copy",
        regionId: null,
      },
    });

    if (existingDoc) {
      await prisma.documentRequirement.update({
        where: { id: existingDoc.id },
        data: { isActive: true },
      });
    } else {
      await prisma.documentRequirement.create({
        data: {
          serviceId: created.id,
          docType: "cnic_copy",
          labelEn: "CNIC copy",
          labelUr: "شناختی کارڈ کی نقول",
          instructionsEn: "Upload a clear CNIC copy.",
          instructionsUr: "شناختی کارڈ کی واضح نقول اپ لوڈ کریں۔",
          isRequired: true,
          maxSizeBytes: 5242880,
          acceptedMimeTypes: DEFAULT_MIME_TYPES,
          displayOrder: 1,
        },
      });
    }

    await prisma.seoMeta.upsert({
      where: { pageKey: `service:${service.slug}` },
      update: {
        serviceId: created.id,
        metaTitleEn: `${service.nameEn} | PakExcise.com`,
        metaTitleUr: `${service.nameUr} | PakExcise.com`,
        metaDescriptionEn: service.shortDescriptionEn,
        metaDescriptionUr: service.shortDescriptionUr,
        h1En: service.nameEn,
        h1Ur: service.nameUr,
      },
      create: {
        pageKey: `service:${service.slug}`,
        serviceId: created.id,
        metaTitleEn: `${service.nameEn} | PakExcise.com`,
        metaTitleUr: `${service.nameUr} | PakExcise.com`,
        metaDescriptionEn: service.shortDescriptionEn,
        metaDescriptionUr: service.shortDescriptionUr,
        h1En: service.nameEn,
        h1Ur: service.nameUr,
      },
    });
  }

  await seedServiceConfig(prisma, regionMap, serviceMap);
  await seedRegionPlateFormats(prisma, regionMap);

  const blogCategoryIds = await seedBlogCategories(prisma);
  const primaryBlogCategoryId = blogCategoryIds.get(PRIMARY_BLOG_CATEGORY_SLUG) ?? null;
  const primaryBlogSubCategoryId =
    blogCategoryIds.get(PRIMARY_BLOG_SUBCATEGORY_SLUG) ?? null;

  const primaryBlogRelatedServiceIds = (
    await prisma.service.findMany({
      where: {
        slug: { in: [...PRIMARY_BLOG_RELATED_SERVICE_SLUGS] },
        deletedAt: null,
      },
      select: { id: true },
    })
  ).map((service) => service.id);

  await prisma.seoMeta.deleteMany({
    where: {
      pageKey: { startsWith: "blog:" },
      NOT: { pageKey: `blog:${PRIMARY_BLOG_SLUG}` },
    },
  });

  await prisma.blogPost.deleteMany({
    where: { slug: { not: PRIMARY_BLOG_SLUG } },
  });

  const primaryBlog = await prisma.blogPost.upsert({
    where: { slug: PRIMARY_BLOG_SLUG },
    update: {
      titleEn: PRIMARY_BLOG_SEED.titleEn,
      titleUr: PRIMARY_BLOG_SEED.titleUr,
      excerptEn: PRIMARY_BLOG_SEED.excerptEn,
      excerptUr: PRIMARY_BLOG_SEED.excerptUr,
      contentEn: PRIMARY_BLOG_CONTENT_EN,
      contentUr: PRIMARY_BLOG_CONTENT_EN,
      categoryEn: PRIMARY_BLOG_SEED.categoryEn,
      categoryUr: PRIMARY_BLOG_SEED.categoryUr,
      categoryId: primaryBlogCategoryId,
      subCategoryId: primaryBlogSubCategoryId,
      tags: [...PRIMARY_BLOG_SEED.tags],
      authorNameEn: PRIMARY_BLOG_SEED.authorNameEn,
      authorNameUr: PRIMARY_BLOG_SEED.authorNameUr,
      readingTimeMinutes: 8,
      featuredImagePath: PRIMARY_BLOG_SEED.featuredImagePath,
      featuredImageTitleEn: PRIMARY_BLOG_SEED.featuredImageTitleEn,
      featuredImageTitleUr: PRIMARY_BLOG_SEED.featuredImageTitleUr,
      featuredImageAltEn: PRIMARY_BLOG_SEED.featuredImageAltEn,
      featuredImageAltUr: PRIMARY_BLOG_SEED.featuredImageAltUr,
      focusKeywords: PRIMARY_BLOG_SEED.focusKeywords,
      isFeatured: PRIMARY_BLOG_SEED.isFeatured,
      showTableOfContents: PRIMARY_BLOG_SEED.showTableOfContents,
      contentFaqs: [...PRIMARY_BLOG_CONTENT_FAQS],
      isPublished: true,
      publishedAt: new Date(),
      relatedServiceIds: primaryBlogRelatedServiceIds,
    },
    create: {
      slug: PRIMARY_BLOG_SLUG,
      titleEn: PRIMARY_BLOG_SEED.titleEn,
      titleUr: PRIMARY_BLOG_SEED.titleUr,
      excerptEn: PRIMARY_BLOG_SEED.excerptEn,
      excerptUr: PRIMARY_BLOG_SEED.excerptUr,
      contentEn: PRIMARY_BLOG_CONTENT_EN,
      contentUr: PRIMARY_BLOG_CONTENT_EN,
      categoryEn: PRIMARY_BLOG_SEED.categoryEn,
      categoryUr: PRIMARY_BLOG_SEED.categoryUr,
      categoryId: primaryBlogCategoryId,
      subCategoryId: primaryBlogSubCategoryId,
      tags: [...PRIMARY_BLOG_SEED.tags],
      authorNameEn: PRIMARY_BLOG_SEED.authorNameEn,
      authorNameUr: PRIMARY_BLOG_SEED.authorNameUr,
      readingTimeMinutes: 8,
      featuredImagePath: PRIMARY_BLOG_SEED.featuredImagePath,
      featuredImageTitleEn: PRIMARY_BLOG_SEED.featuredImageTitleEn,
      featuredImageTitleUr: PRIMARY_BLOG_SEED.featuredImageTitleUr,
      featuredImageAltEn: PRIMARY_BLOG_SEED.featuredImageAltEn,
      featuredImageAltUr: PRIMARY_BLOG_SEED.featuredImageAltUr,
      focusKeywords: PRIMARY_BLOG_SEED.focusKeywords,
      isFeatured: PRIMARY_BLOG_SEED.isFeatured,
      showTableOfContents: PRIMARY_BLOG_SEED.showTableOfContents,
      contentFaqs: [...PRIMARY_BLOG_CONTENT_FAQS],
      isPublished: true,
      publishedAt: new Date(),
      relatedServiceIds: primaryBlogRelatedServiceIds,
    },
  });

  await prisma.seoMeta.upsert({
    where: { pageKey: `blog:${PRIMARY_BLOG_SLUG}` },
    update: {
      blogPostId: primaryBlog.id,
      ...PRIMARY_BLOG_SEED.seo,
    },
    create: {
      pageKey: `blog:${PRIMARY_BLOG_SLUG}`,
      blogPostId: primaryBlog.id,
      ...PRIMARY_BLOG_SEED.seo,
    },
  });

  for (const method of PAYMENT_METHOD_SEED) {
    const existing = await prisma.paymentMethod.findFirst({
      where: { code: method.code },
    });

    if (existing) {
      await prisma.paymentMethod.update({
        where: { id: existing.id },
        data: { ...method, isActive: true },
      });
    } else {
      await prisma.paymentMethod.create({
        data: { ...method, isActive: true },
      });
    }
  }

  for (const link of SOCIAL_SEED) {
    const existing = await prisma.socialLink.findFirst({
      where: { platform: link.platform },
    });

    if (existing) {
      await prisma.socialLink.update({
        where: { id: existing.id },
        data: { ...link, isActive: true },
      });
    } else {
      await prisma.socialLink.create({ data: { ...link, isActive: true } });
    }
  }

  for (const review of REVIEW_SEED) {
    const existing = await prisma.review.findFirst({
      where: { authorNameEn: review.authorNameEn },
    });

    if (existing) {
      await prisma.review.update({ where: { id: existing.id }, data: review });
    } else {
      await prisma.review.create({ data: { ...review, isActive: true } });
    }
  }

  const legacyServiceSlugs = [
    "vehicle-transfer-punjab",
    "vehicle-transfer-islamabad-ict",
    "token-tax",
    "token-tax-all-provinces",
    "new-vehicle-registration-punjab",
    "new-vehicle-registration-islamabad-ict",
    "vehicle-inspection",
    "vehicle-inspection-punjab",
    "vehicle-inspection-islamabad-ict",
    "vehicle-passing-fitness-islamabad-ict",
    "route-permit-punjab",
    "route-permit-islamabad-ict",
    "data-correction-punjab-ict",
    "data-correction-islamabad-ict",
    "driving-license-renewal-punjab",
    "driving-license-renewal-punjab-ict",
    "learner-license-punjab-ict",
  ];

  await prisma.service.updateMany({
    where: { slug: { in: legacyServiceSlugs } },
    data: { isActive: false },
  });

  const redirects = [
    { oldSlug: "token-tax-all-provinces", newSlug: "token-tax-payment" },
    { oldSlug: "token-tax", newSlug: "token-tax-payment" },
    { oldSlug: "vehicle-transfer-punjab", newSlug: "vehicle-transfer" },
    { oldSlug: "vehicle-transfer-islamabad-ict", newSlug: "vehicle-transfer" },
    {
      oldSlug: "new-vehicle-registration-punjab",
      newSlug: "new-vehicle-registration",
    },
    {
      oldSlug: "new-vehicle-registration-islamabad-ict",
      newSlug: "new-vehicle-registration",
    },
    { oldSlug: "vehicle-inspection", newSlug: "vehicle-passing-fitness" },
    { oldSlug: "vehicle-inspection-punjab", newSlug: "vehicle-passing-fitness" },
    {
      oldSlug: "vehicle-inspection-islamabad-ict",
      newSlug: "vehicle-passing-fitness",
    },
    {
      oldSlug: "vehicle-passing-fitness-islamabad-ict",
      newSlug: "vehicle-passing-fitness",
    },
    { oldSlug: "route-permit-punjab", newSlug: "route-permit" },
    { oldSlug: "route-permit-islamabad-ict", newSlug: "route-permit" },
    { oldSlug: "data-correction-punjab-ict", newSlug: "vehicle-data-correction" },
    {
      oldSlug: "data-correction-islamabad-ict",
      newSlug: "vehicle-data-correction",
    },
    {
      oldSlug: "driving-license-renewal-punjab-ict",
      newSlug: "driving-license-renewal",
    },
    {
      oldSlug: "learner-license-punjab-ict",
      newSlug: "learner-license",
    },
    { oldSlug: "privacy", newSlug: "privacy-policy" },
    { oldSlug: "terms", newSlug: "terms-and-conditions" },
    { oldSlug: "refund", newSlug: "refund-policy" },
  ];

  for (const redirect of redirects) {
    await prisma.redirect.upsert({
      where: { oldSlug: redirect.oldSlug },
      update: { newSlug: redirect.newSlug, isActive: true },
      create: { ...redirect, isActive: true },
    });
  }

  // Remove legacy redirect that sent the canonical slug to the old slug.
  await prisma.redirect.updateMany({
    where: { oldSlug: "token-tax-payment", newSlug: "token-tax" },
    data: { isActive: false },
  });

  const staticPages: Array<{
    key: string;
    titleEn: string;
    titleUr: string;
    contentEn: string;
    contentUr: string;
  }> = [
    {
      key: "how-it-works",
      titleEn: "How It Works",
      titleUr: "یہ کیسے کام کرتا ہے",
      contentEn:
        "## Choose a service\nBrowse services by region and select the facilitation you need.\n\n## Submit your application\nComplete the dynamic form and upload required documents securely.\n\n## Track and complete\nTrack status updates, receive invoices after review, and download completion proof when ready.\n\n" +
        PRIVATE_DISCLAIMER_EN,
      contentUr:
        "## سروس منتخب کریں\nعلاقے کے مطابق سروسز دیکھیں اور مطلوبہ سہولت منتخب کریں۔\n\n## درخواست جمع کرائیں\nڈائنامک فارم مکمل کریں اور دستاویزات محفوظ طریقے سے اپ لوڈ کریں۔\n\n## ٹریک کریں اور مکمل کریں\nاسٹیٹس اپڈیٹس دیکھیں، جائزے کے بعد انوائس حاصل کریں، اور تکمیل ثبوت ڈاؤن لوڈ کریں۔\n\n" +
        PRIVATE_DISCLAIMER_UR,
    },
    {
      key: "documents",
      titleEn: "Required Documents",
      titleUr: "ضروری دستاویزات",
      contentEn:
        "Document requirements vary by service. Each service page lists required and optional documents managed by admin.\n\nStart by opening a service, review the checklist, then apply when ready.\n\n" +
        PRIVATE_DISCLAIMER_EN,
      contentUr:
        "دستاویزات کی ضروریات سروس کے مطابق مختلف ہوتی ہیں۔ ہر سروس صفحے پر ایڈمن کے ذریعے منظم چیک لسٹ موجود ہے۔\n\nسروس کھولیں، چیک لسٹ دیکھیں، پھر درخواست دیں۔\n\n" +
        PRIVATE_DISCLAIMER_UR,
    },
    {
      key: "agents",
      titleEn: "Agent Program",
      titleUr: "ایجنٹ پروگرام",
      contentEn:
        "PakExcise agents help customers submit applications through a private facilitation platform.\n\nAgents can track assigned applications and view commissions after approval.\n\n" +
        PRIVATE_DISCLAIMER_EN,
      contentUr:
        "PakExcise ایجنٹس نجی سہولت پلیٹ فارم کے ذریعے گاہکوں کی درخواستیں جمع کرانے میں مدد کرتے ہیں۔\n\nایجنٹس منظوری کے بعد تفویض شدہ درخواستیں اور کمیشن دیکھ سکتے ہیں۔\n\n" +
        PRIVATE_DISCLAIMER_UR,
    },
    {
      key: "agent-register",
      titleEn: "Become an Agent",
      titleUr: "ایجنٹ بنیں",
      contentEn:
        "Register for the PakExcise agent program. Applications are reviewed by admin before approval.\n\nCreate an account, select agent signup, and complete verification.\n\n" +
        PRIVATE_DISCLAIMER_EN,
      contentUr:
        "PakExcise ایجنٹ پروگرام کے لیے رجسٹر کریں۔ منظوری سے پہلے ایڈمن جائزہ لیتا ہے۔\n\nاکاؤنٹ بنائیں، ایجنٹ سائن اپ منتخب کریں، اور تصدیق مکمل کریں۔\n\n" +
        PRIVATE_DISCLAIMER_UR,
    },
    {
      key: "payment-policy",
      titleEn: "Payment Policy",
      titleUr: "ادائیگی کی پالیسی",
      contentEn:
        "PakExcise facilitation fees are shared only through invoices after application review. Government official fees are listed separately when applicable.\n\nNo service fees are displayed on public pages.\n\n" +
        PRIVATE_DISCLAIMER_EN,
      contentUr:
        "PakExcise سہولت فیس صرف درخواست جائزے کے بعد انوائس کے ذریعے شیئر کی جاتی ہے۔ سرکاری فیس الگ دکھائی جاتی ہے۔\n\nعوامی صفحات پر کوئی فیس نہیں۔\n\n" +
        PRIVATE_DISCLAIMER_UR,
    },
    {
      key: "cookie-policy",
      titleEn: "Cookie Policy",
      titleUr: "کوکی پالیسی",
      contentEn:
        "PakExcise uses essential cookies for authentication, locale, and theme preferences. Analytics cookies may be used according to consent settings.\n\n" +
        PRIVATE_DISCLAIMER_EN,
      contentUr:
        "PakExcise تصدیق، زبان اور تھیم کے لیے ضروری کوکیز استعمال کرتا ہے۔ تجزیاتی کوکیز رضامندی کے مطابق۔\n\n" +
        PRIVATE_DISCLAIMER_UR,
    },
    {
      key: "reviews",
      titleEn: "Customer Reviews",
      titleUr: "گاہکوں کی رائے",
      contentEn:
        "Read what customers say about PakExcise private facilitation support.\n\n" +
        PRIVATE_DISCLAIMER_EN,
      contentUr:
        "PakExcise نجی سہولت سپورٹ کے بارے میں گاہکوں کی رائے پڑھیں۔\n\n" +
        PRIVATE_DISCLAIMER_UR,
    },
    {
      key: "privacy-policy",
      titleEn: "Privacy Policy",
      titleUr: "رازداری کی پالیسی",
      contentEn:
        "PakExcise.com protects your personal data using encryption for sensitive fields, secure document storage, and server-side access controls.\n\nWe do not sell your data.\n\n" +
        PRIVATE_DISCLAIMER_EN,
      contentUr:
        "PakExcise.com حساس فیلڈز کی خفیہ کاری اور محفوظ اسٹوریج کے ذریعے ڈیٹا کی حفاظت کرتا ہے۔\n\nہم ڈیٹا فروخت نہیں کرتے۔\n\n" +
        PRIVATE_DISCLAIMER_UR,
    },
    {
      key: "terms-and-conditions",
      titleEn: "Terms and Conditions",
      titleUr: "شرائط و ضوابط",
      contentEn:
        "By using PakExcise.com, you agree that this is a private facilitation service and not a government portal.\n\n" +
        PRIVATE_DISCLAIMER_EN,
      contentUr:
        "PakExcise.com استعمال کر کے آپ تسلیم کرتے ہیں کہ یہ نجی سہولت سروس ہے۔\n\n" +
        PRIVATE_DISCLAIMER_UR,
    },
    {
      key: "refund-policy",
      titleEn: "Refund Policy",
      titleUr: "واپسی کی پالیسی",
      contentEn:
        "Refund eligibility depends on application status and work completed. Contact support with your tracking ID.\n\n" +
        PRIVATE_DISCLAIMER_EN,
      contentUr:
        "واپسی کی اہلیت درخواست کی حیثیت پر منحصر ہے۔ ٹریکنگ ID کے ساتھ سپورٹ سے رابطہ کریں۔\n\n" +
        PRIVATE_DISCLAIMER_UR,
    },
  ];

  for (const page of staticPages) {
    await prisma.setting.upsert({
      where: { key: `page:${page.key}` },
      update: {
        value: {
          titleEn: page.titleEn,
          titleUr: page.titleUr,
          contentEn: page.contentEn,
          contentUr: page.contentUr,
        },
      },
      create: {
        key: `page:${page.key}`,
        value: {
          titleEn: page.titleEn,
          titleUr: page.titleUr,
          contentEn: page.contentEn,
          contentUr: page.contentUr,
        },
      },
    });

    await prisma.seoMeta.upsert({
      where: { pageKey: `page:${page.key}` },
      update: {
        metaTitleEn: `${page.titleEn} | PakExcise.com`,
        metaTitleUr: `${page.titleUr} | PakExcise.com`,
        h1En: page.titleEn,
        h1Ur: page.titleUr,
      },
      create: {
        pageKey: `page:${page.key}`,
        metaTitleEn: `${page.titleEn} | PakExcise.com`,
        metaTitleUr: `${page.titleUr} | PakExcise.com`,
        h1En: page.titleEn,
        h1Ur: page.titleUr,
      },
    });
  }

  const servicesNeedingRegionSync = await prisma.service.findMany({
    where: {
      regionId: { not: null },
      serviceRegions: { none: {} },
    },
    select: { id: true, regionId: true },
  });

  for (const service of servicesNeedingRegionSync) {
    if (!service.regionId) continue;

    await prisma.serviceRegion.create({
      data: {
        serviceId: service.id,
        regionId: service.regionId,
        displayOrder: 0,
        isActive: true,
      },
    });
  }

  await seedLegalPages(prisma);

  console.log("Marketing content seeded.");
}
