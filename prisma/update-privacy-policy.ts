import { PrismaClient } from "@prisma/client";

import {
  PRIVACY_POLICY_CONTENT_EN,
  PRIVACY_POLICY_SEO,
} from "../features/legal-pages/lib/content/privacy-policy-en";

const prisma = new PrismaClient();

const LAST_UPDATED = new Date("2026-06-24T08:00:00.000Z");

async function main() {
  const page = await prisma.legalPage.findUnique({
    where: { slug: "privacy-policy" },
    select: { id: true },
  });

  if (!page) {
    throw new Error("Legal page privacy-policy not found. Run npm run db:seed-legal first.");
  }

  await prisma.legalPage.update({
    where: { id: page.id },
    data: {
      titleEn: "Privacy Policy",
      excerptEn: PRIVACY_POLICY_SEO.excerptEn,
      contentEn: PRIVACY_POLICY_CONTENT_EN,
      isPublished: true,
      isActive: true,
      updatedAt: LAST_UPDATED,
    },
  });

  await prisma.seoMeta.upsert({
    where: { legalPageId: page.id },
    update: {
      metaTitleEn: PRIVACY_POLICY_SEO.metaTitleEn,
      metaDescriptionEn: PRIVACY_POLICY_SEO.metaDescriptionEn,
      h1En: PRIVACY_POLICY_SEO.h1En,
      canonicalUrl: PRIVACY_POLICY_SEO.canonicalUrl,
      ogTitleEn: PRIVACY_POLICY_SEO.ogTitleEn,
      ogDescriptionEn: PRIVACY_POLICY_SEO.ogDescriptionEn,
      robotsIndex: true,
      robotsFollow: true,
    },
    create: {
      pageKey: "legal:privacy-policy",
      legalPageId: page.id,
      metaTitleEn: PRIVACY_POLICY_SEO.metaTitleEn,
      metaDescriptionEn: PRIVACY_POLICY_SEO.metaDescriptionEn,
      h1En: PRIVACY_POLICY_SEO.h1En,
      canonicalUrl: PRIVACY_POLICY_SEO.canonicalUrl,
      ogTitleEn: PRIVACY_POLICY_SEO.ogTitleEn,
      ogDescriptionEn: PRIVACY_POLICY_SEO.ogDescriptionEn,
      robotsIndex: true,
      robotsFollow: true,
    },
  });

  console.log("Privacy Policy updated successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
