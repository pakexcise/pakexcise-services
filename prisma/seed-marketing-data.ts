import type { PrismaClient } from "@prisma/client";

import {
  LEGACY_SERVICE_SLUGS_TO_DEACTIVATE,
} from "../config/legacy-url-redirects";
import { REGION_SLUG_ALIASES } from "../config/region-slugs";
import { CITY_SEED } from "./seed-cities-data";
import { seedServiceConfig } from "./seed-service-config";
import { seedRegionPlateFormats } from "./seed-region-plate-formats";
import { seedLegalPages } from "./seed-legal-pages";
import { seedPrimaryBlogPost } from "./seed-primary-blog";
import {
  cleanupLegacyServiceSeo,
  syncAllActiveServiceRegionSeo,
} from "../features/services/lib/sync-service-region-seo";

const DEFAULT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const PRIVATE_DISCLAIMER_EN =
  "PakExcise.com is a private facilitation service and is not affiliated with Excise & Taxation, MTMIS, NADRA, ICT Excise, or any Government of Pakistan body.";

export const REGION_SEED = [
  {
    slug: "punjab",
    nameEn: "Punjab",
    descriptionEn:
      "Private excise facilitation support for vehicle and license services across Punjab province.",
    displayOrder: 1,
  },
  {
    slug: "sindh",
    nameEn: "Sindh",
    descriptionEn:
      "Private facilitation guidance for excise-related processes in Sindh province.",
    displayOrder: 2,
  },
  {
    slug: "kpk",
    nameEn: "Khyber Pakhtunkhwa",
    descriptionEn:
      "Private facilitation support for excise services in Khyber Pakhtunkhwa.",
    displayOrder: 3,
  },
  {
    slug: "balochistan",
    nameEn: "Balochistan",
    descriptionEn:
      "Private facilitation support for excise services in Balochistan.",
    displayOrder: 4,
  },
  {
    slug: "islamabad",
    nameEn: "Islamabad ICT",
    descriptionEn:
      "Private excise facilitation for Islamabad Capital Territory services.",
    displayOrder: 5,
  },
  {
    slug: "gilgit-baltistan",
    nameEn: "Gilgit-Baltistan",
    descriptionEn:
      "Private facilitation guidance for excise-related processes in Gilgit-Baltistan.",
    displayOrder: 6,
  },
  {
    slug: "ajk",
    nameEn: "Azad Jammu & Kashmir",
    descriptionEn:
      "Private facilitation guidance for excise-related processes in Azad Kashmir.",
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
    descriptionEn:
      "Private facilitation for vehicle transfer, registration, token tax, route permits, and related excise support.",
    displayOrder: 1,
  },
  {
    slug: "license-services",
    nameEn: "License Services",
    descriptionEn:
      "Private facilitation for driving license renewal and learner license applications.",
    displayOrder: 2,
  },
  {
    slug: "e-challan-safe-city",
    nameEn: "E-Challan / Safe City",
    descriptionEn:
      "Private guidance for e-challan and Safe City-related facilitation across Pakistan.",
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
    shortDescriptionEn:
      "Private facilitation for vehicle ownership transfer in Punjab and Islamabad ICT.",
    displayOrder: 1,
  },
  {
    slug: "token-tax-payment",
    regionSlugs: TOKEN_TAX_REGION_SLUGS,
    categorySlug: "vehicle-services",
    nameEn: "Token Tax Payment",
    shortDescriptionEn:
      "Private facilitation support for token tax payment across supported provinces.",
    displayOrder: 2,
  },
  {
    slug: "new-vehicle-registration",
    regionSlugs: ["punjab", "islamabad"],
    categorySlug: "vehicle-services",
    nameEn: "New Vehicle Registration",
    shortDescriptionEn:
      "Private facilitation for new vehicle registration in Punjab and Islamabad ICT.",
    displayOrder: 3,
  },
  {
    slug: "vehicle-passing-fitness",
    regionSlugs: ["islamabad"],
    categorySlug: "vehicle-services",
    nameEn: "Vehicle Passing / Fitness",
    shortDescriptionEn:
      "Private facilitation for vehicle passing and fitness processes in Islamabad ICT.",
    displayOrder: 4,
  },
  {
    slug: "route-permit",
    regionSlugs: ["punjab", "islamabad"],
    categorySlug: "vehicle-services",
    nameEn: "Route Permit",
    shortDescriptionEn:
      "Private facilitation for route permit services in Punjab and Islamabad ICT.",
    displayOrder: 5,
  },
  {
    slug: "route-permit-new",
    parentSlug: "route-permit",
    regionSlugs: ["punjab"],
    categorySlug: "vehicle-services",
    nameEn: "New Route Permit",
    shortDescriptionEn: "Private facilitation for new route permit applications.",
    displayOrder: 1,
  },
  {
    slug: "route-permit-noc",
    parentSlug: "route-permit",
    regionSlugs: ["punjab"],
    categorySlug: "vehicle-services",
    nameEn: "Route Permit NOC",
    shortDescriptionEn: "Private facilitation for route permit NOC requests.",
    displayOrder: 2,
  },
  {
    slug: "route-permit-duplicate",
    parentSlug: "route-permit",
    regionSlugs: ["punjab"],
    categorySlug: "vehicle-services",
    nameEn: "Route Permit Duplicate",
    shortDescriptionEn:
      "Private facilitation for duplicate route permit applications.",
    displayOrder: 3,
  },
  {
    slug: "vehicle-data-correction",
    regionSlugs: ["punjab", "islamabad"],
    categorySlug: "vehicle-services",
    nameEn: "Data Correction",
    shortDescriptionEn:
      "Private facilitation for excise record data correction in Punjab and Islamabad ICT.",
    displayOrder: 6,
  },
  {
    slug: "driving-license-renewal",
    regionSlugs: ["punjab"],
    categorySlug: "license-services",
    nameEn: "Driving License Renewal",
    shortDescriptionEn:
      "Private facilitation for driving license renewal in Punjab.",
    displayOrder: 1,
  },
  {
    slug: "learner-license",
    regionSlugs: ["punjab", "islamabad"],
    categorySlug: "license-services",
    nameEn: "Learner's License",
    shortDescriptionEn:
      "Private facilitation for learner license applications in Punjab and Islamabad ICT.",
    displayOrder: 2,
  },
  {
    slug: "e-challan",
    regionSlugs: ALL_REGION_SLUGS,
    categorySlug: "e-challan-safe-city",
    nameEn: "E-Challan",
    shortDescriptionEn:
      "Private facilitation guidance for e-challan support across Pakistan provinces.",
    displayOrder: 1,
  },
] as const;

export const BLOG_SEED = [] as const;

export const PAYMENT_METHOD_SEED = [
  {
    code: "meezan-bank",
    type: "BANK_TRANSFER" as const,
    nameEn: "Meezan Bank",
    accountTitleEn: "RASHID SHAHBAZ SHARIF",
    accountNumber: "03300111833629",
    iban: "PK30MEZN0003300111833629",
    bankNameEn: "Meezan Bank",
    instructionsEn: null,
    displayOrder: 1,
  },
  {
    code: "easypaisa",
    type: "EASYPAISA" as const,
    nameEn: "Easypaisa",
    accountTitleEn: "Rashid Shahbaz Sharif",
    accountNumber: "03413110094",
    iban: null,
    bankNameEn: null,
    instructionsEn: null,
    displayOrder: 2,
  },
] as const;

export const SOCIAL_SEED = [
  {
    platform: "facebook",
    labelEn: "Facebook",
    url: "https://www.facebook.com/pakexcise/",
    iconName: "facebook",
    displayOrder: 1,
  },
  {
    platform: "instagram",
    labelEn: "Instagram",
    url: "https://www.instagram.com/pakexcise/",
    iconName: "instagram",
    displayOrder: 2,
  },
  {
    platform: "tiktok",
    labelEn: "TikTok",
    url: "https://www.tiktok.com/@pakexcise",
    iconName: "tiktok",
    displayOrder: 3,
  },
  {
    platform: "youtube",
    labelEn: "YouTube",
    url: "https://www.youtube.com/@PakExcise",
    iconName: "youtube",
    displayOrder: 4,
  },
  {
    platform: "linkedin",
    labelEn: "LinkedIn",
    url: "https://www.linkedin.com/in/pakexcise/",
    iconName: "linkedin",
    displayOrder: 5,
  },
  {
    platform: "x",
    labelEn: "X (Twitter)",
    url: "https://x.com/pakexcise",
    iconName: "x",
    displayOrder: 6,
  },
] as const;

export const REVIEW_SEED = [
  {
    externalId: "seed:generic:ahmed-r",
    authorNameEn: "Ahmed R.",
    authorRoleEn: "Vehicle transfer customer",
    contentEn:
      "Process was clear from start. WhatsApp updates helped, and fees only came on invoice after review. Private service, not government.",
    rating: 5,
    displayOrder: 1,
  },
  {
    externalId: "seed:generic:usman-k",
    authorNameEn: "Usman K.",
    authorRoleEn: "Token tax facilitation",
    contentEn:
      "Very smooth experience. The team shared a clear document checklist, and tracking updates stayed visible on the dashboard.",
    rating: 5,
    displayOrder: 2,
  },
  {
    externalId: "seed:generic:bilal-h",
    authorNameEn: "Bilal H.",
    authorRoleEn: "New registration customer",
    contentEn:
      "Professional handling from application to completion proof. Response on WhatsApp was fast.",
    rating: 5,
    displayOrder: 3,
  },
  {
    externalId: "seed:generic:hamza-a",
    authorNameEn: "Hamza A.",
    authorRoleEn: "Driving license renewal",
    contentEn:
      "My license renewal was completed on time. The steps were simple, and private facilitation was clearly mentioned.",
    rating: 4,
    displayOrder: 4,
  },
  {
    externalId: "seed:generic:imran-s",
    authorNameEn: "Imran S.",
    authorRoleEn: "Route permit support",
    contentEn:
      "Good follow-up and honest process. No fee shown on the public page, only shared after invoice.",
    rating: 5,
    displayOrder: 5,
  },
] as const;

function serviceContent(shortEn: string) {
  return {
    contentEn: `${shortEn}\n\n## Overview\nOur team helps you prepare documents, submit your application, and track progress through a private facilitation service.\n\n## Why choose PakExcise\n- Dedicated support via WhatsApp and dashboard\n- Document checklist guidance\n- Status tracking with notes on every update`,
    processingNotesEn: null,
  };
}


async function upsertSeedReview(
  prisma: PrismaClient,
  input: {
    externalId: string;
    authorNameEn: string;
    authorRoleEn: string;
    contentEn: string;
    rating: number;
    displayOrder: number;
    serviceId?: string;
  },
): Promise<void> {
  const existing =
    (await prisma.review.findUnique({
      where: {
        source_externalId: {
          source: "MANUAL",
          externalId: input.externalId,
        },
      },
      select: { id: true },
    })) ??
    (await prisma.review.findFirst({
      where: {
        source: "MANUAL",
        externalId: null,
        authorNameEn: input.authorNameEn,
        ...(input.serviceId ? { serviceId: input.serviceId } : { serviceId: null }),
      },
      select: { id: true },
    }));

  const contentData = {
    authorNameEn: input.authorNameEn,
    authorRoleEn: input.authorRoleEn,
    contentEn: input.contentEn,
    rating: input.rating,
    displayOrder: input.displayOrder,
    serviceId: input.serviceId ?? null,
    externalId: input.externalId,
  };

  if (existing) {
    await prisma.review.update({
      where: { id: existing.id },
      data: contentData,
    });
    return;
  }

  await prisma.review.create({
    data: {
      ...contentData,
      source: "MANUAL",
      status: "PENDING",
      isActive: false,
      customerConsent: true,
    },
  });
}

export async function seedReviews(prisma: PrismaClient): Promise<void> {
  for (const review of REVIEW_SEED) {
    await upsertSeedReview(prisma, review);
  }

  const activeServices = await prisma.service.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: [{ displayOrder: "asc" }, { slug: "asc" }],
    select: { id: true, nameEn: true, slug: true },
  });

  const sampleMaleNames = [
    "Ali M.",
    "Farhan Z.",
    "Kashif N.",
    "Omar T.",
    "Naveed J.",
    "Saad W.",
    "Zain Q.",
    "Rehan L.",
  ];

  for (const [index, service] of activeServices.entries()) {
    const authorNameEn = sampleMaleNames[index % sampleMaleNames.length] ?? "Customer";
    const sampleContent =
      index % 2 === 0
        ? `Support for ${service.nameEn} was clear. WhatsApp replies were quick and tracking stayed easy.`
        : `Helpful private facilitation for ${service.nameEn}. Transparent steps and invoice-only fee sharing.`;

    await upsertSeedReview(prisma, {
      externalId: `seed:service:${service.slug}`,
      authorNameEn,
      authorRoleEn: service.nameEn,
      contentEn: sampleContent,
      rating: index % 3 === 0 ? 4 : 5,
      displayOrder: 100 + index,
      serviceId: service.id,
    });
  }
}

export async function seedMarketingData(prisma: PrismaClient): Promise<void> {
  console.log("Seeding marketing content...");

  for (const region of REGION_SEED) {
    await prisma.region.upsert({
      where: { slug: region.slug },
      update: {
        nameEn: region.nameEn,
        descriptionEn: region.descriptionEn,
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
          descriptionEn: city.descriptionEn,
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
          metaDescriptionEn: city.descriptionEn,
          h1En: city.nameEn,
        },
        create: {
          pageKey: `city:${regionSlug}:${city.slug}`,
          cityId: created.id,
          metaTitleEn: `${city.nameEn} Excise Services | PakExcise.com`,
          metaDescriptionEn: city.descriptionEn,
          h1En: city.nameEn,
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
        metaDescriptionEn: region.descriptionEn,
        h1En: region.nameEn,
      },
      create: {
        pageKey: `region:${region.slug}`,
        regionId,
        metaTitleEn: `${region.nameEn} Services | PakExcise.com`,
        metaDescriptionEn: region.descriptionEn,
        h1En: region.nameEn,
      },
    });
  }

  const categoryMap: Record<string, string> = {};
  for (const category of CATEGORY_SEED) {
    const created = await prisma.serviceCategory.upsert({
      where: { slug: category.slug },
      update: {
        nameEn: category.nameEn,
        descriptionEn: category.descriptionEn,
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
    );

    const created = await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        regionId: primaryRegionId,
        categoryId,
        parentServiceId,
        nameEn: service.nameEn,
        shortDescriptionEn: service.shortDescriptionEn,
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
        shortDescriptionEn: service.shortDescriptionEn,
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
          instructionsEn: "Upload a clear CNIC copy.",
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
        metaDescriptionEn: service.shortDescriptionEn,
        h1En: service.nameEn,
      },
      create: {
        pageKey: `service:${service.slug}`,
        serviceId: created.id,
        metaTitleEn: `${service.nameEn} | PakExcise.com`,
        metaDescriptionEn: service.shortDescriptionEn,
        h1En: service.nameEn,
      },
    });
  }

  await seedServiceConfig(prisma, regionMap, serviceMap);
  await seedRegionPlateFormats(prisma, regionMap);

  await seedPrimaryBlogPost(prisma, { replaceOtherPosts: true });

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

  await seedReviews(prisma);

  await prisma.service.updateMany({
    where: { slug: { in: [...LEGACY_SERVICE_SLUGS_TO_DEACTIVATE] } },
    data: { isActive: false },
  });

  // Admin Redirects table stays empty by default.
  // Built-in legacy service / legal / region aliases live in next.config.ts.
  await prisma.redirect.deleteMany({});

  const staticPages: Array<{
    key: string;
    titleEn: string;
    contentEn: string;
  }> = [
    {
      key: "how-it-works",
      titleEn: "How It Works",
      contentEn:
        "## Choose a service\nBrowse services by region and select the facilitation you need.\n\n## Submit your application\nComplete the dynamic form and upload required documents securely.\n\n## Track and complete\nTrack status updates, receive invoices after review, and download completion proof when ready.\n\n" +
        PRIVATE_DISCLAIMER_EN,
    },
    {
      key: "documents",
      titleEn: "Required Documents",
      contentEn:
        "Document requirements vary by service. Each service page lists required and optional documents managed by admin.\n\nStart by opening a service, review the checklist, then apply when ready.\n\n" +
        PRIVATE_DISCLAIMER_EN,
    },
    {
      key: "agents",
      titleEn: "Agent Program",
      contentEn:
        "PakExcise agents help customers submit applications through a private facilitation platform.\n\nAgents can track assigned applications and view commissions after approval.\n\n" +
        PRIVATE_DISCLAIMER_EN,
    },
    {
      key: "agent-register",
      titleEn: "Become an Agent",
      contentEn:
        "Register for the PakExcise agent program. Applications are reviewed by admin before approval.\n\nCreate an account, select agent signup, and complete verification.\n\n" +
        PRIVATE_DISCLAIMER_EN,
    },
    {
      key: "payment-policy",
      titleEn: "Payment Policy",
      contentEn:
        "PakExcise facilitation fees are shared only through invoices after application review. Government official fees are listed separately when applicable.\n\nNo service fees are displayed on public pages.\n\n" +
        PRIVATE_DISCLAIMER_EN,
    },
    {
      key: "cookie-policy",
      titleEn: "Cookie Policy",
      contentEn:
        "PakExcise uses essential cookies for authentication, locale, and theme preferences. Analytics cookies may be used according to consent settings.\n\n" +
        PRIVATE_DISCLAIMER_EN,
    },
    {
      key: "reviews",
      titleEn: "Customer Reviews",
      contentEn: "Read what customers say about PakExcise private facilitation support.",
    },
    {
      key: "privacy-policy",
      titleEn: "Privacy Policy",
      contentEn:
        "PakExcise.com protects your personal data using encryption for sensitive fields, secure document storage, and server-side access controls.\n\nWe do not sell your data.\n\n" +
        PRIVATE_DISCLAIMER_EN,
    },
    {
      key: "terms-and-conditions",
      titleEn: "Terms and Conditions",
      contentEn:
        "By using PakExcise.com, you agree that this is a private facilitation service and not a government portal.\n\n" +
        PRIVATE_DISCLAIMER_EN,
    },
    {
      key: "refund-policy",
      titleEn: "Refund Policy",
      contentEn:
        "Refund eligibility depends on application status and work completed. Contact support with your tracking ID.\n\n" +
        PRIVATE_DISCLAIMER_EN,
    },
  ];

  for (const page of staticPages) {
    await prisma.setting.upsert({
      where: { key: `page:${page.key}` },
      update: {
        value: {
          titleEn: page.titleEn,
          contentEn: page.contentEn,
        },
      },
      create: {
        key: `page:${page.key}`,
        value: {
          titleEn: page.titleEn,
          contentEn: page.contentEn,
        },
      },
    });

    await prisma.seoMeta.upsert({
      where: { pageKey: `page:${page.key}` },
      update: {
        metaTitleEn: `${page.titleEn} | PakExcise.com`,
        h1En: page.titleEn,
      },
      create: {
        pageKey: `page:${page.key}`,
        metaTitleEn: `${page.titleEn} | PakExcise.com`,
        h1En: page.titleEn,
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

  await cleanupLegacyServiceSeo();
  await syncAllActiveServiceRegionSeo();

  console.log("Marketing content seeded.");
}
