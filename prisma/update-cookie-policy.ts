import { PrismaClient } from "@prisma/client";

import {
  COOKIE_POLICY_CONTENT_EN,
  COOKIE_POLICY_SEO,
} from "../features/legal-pages/lib/content/cookie-policy-en";

const prisma = new PrismaClient();

const LAST_UPDATED = new Date("2026-06-24T08:00:00.000Z");

async function main() {
  const page = await prisma.legalPage.findUnique({
    where: { slug: "cookie-policy" },
    select: { id: true },
  });

  if (!page) {
    throw new Error("Legal page cookie-policy not found. Run npm run db:seed-legal first.");
  }

  await prisma.legalPage.update({
    where: { id: page.id },
    data: {
      titleEn: "Cookie Policy",
      excerptEn: COOKIE_POLICY_SEO.excerptEn,
      contentEn: COOKIE_POLICY_CONTENT_EN,
      isPublished: true,
      isActive: true,
      updatedAt: LAST_UPDATED,
    },
  });

  await prisma.seoMeta.upsert({
    where: { legalPageId: page.id },
    update: {
      metaTitleEn: COOKIE_POLICY_SEO.metaTitleEn,
      metaDescriptionEn: COOKIE_POLICY_SEO.metaDescriptionEn,
      h1En: COOKIE_POLICY_SEO.h1En,
      canonicalUrl: COOKIE_POLICY_SEO.canonicalUrl,
      ogTitleEn: COOKIE_POLICY_SEO.ogTitleEn,
      ogDescriptionEn: COOKIE_POLICY_SEO.ogDescriptionEn,
      robotsIndex: true,
      robotsFollow: true,
    },
    create: {
      pageKey: "legal:cookie-policy",
      legalPageId: page.id,
      metaTitleEn: COOKIE_POLICY_SEO.metaTitleEn,
      metaDescriptionEn: COOKIE_POLICY_SEO.metaDescriptionEn,
      h1En: COOKIE_POLICY_SEO.h1En,
      canonicalUrl: COOKIE_POLICY_SEO.canonicalUrl,
      ogTitleEn: COOKIE_POLICY_SEO.ogTitleEn,
      ogDescriptionEn: COOKIE_POLICY_SEO.ogDescriptionEn,
      robotsIndex: true,
      robotsFollow: true,
    },
  });

  console.log("Cookie Policy updated successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
