import { PrismaClient } from "@prisma/client";

import {
  DISCLAIMER_CONTENT_EN,
  DISCLAIMER_SEO,
} from "../features/legal-pages/lib/content/disclaimer-en";

const prisma = new PrismaClient();

const LAST_UPDATED = new Date("2026-06-24T08:00:00.000Z");

async function main() {
  const page = await prisma.legalPage.findUnique({
    where: { slug: "disclaimer" },
    select: { id: true },
  });

  if (!page) {
    throw new Error("Legal page disclaimer not found. Run npm run db:seed-legal first.");
  }

  await prisma.legalPage.update({
    where: { id: page.id },
    data: {
      titleEn: "Disclaimer",
      excerptEn: DISCLAIMER_SEO.excerptEn,
      contentEn: DISCLAIMER_CONTENT_EN,
      isPublished: true,
      isActive: true,
      updatedAt: LAST_UPDATED,
    },
  });

  await prisma.seoMeta.upsert({
    where: { legalPageId: page.id },
    update: {
      metaTitleEn: DISCLAIMER_SEO.metaTitleEn,
      metaDescriptionEn: DISCLAIMER_SEO.metaDescriptionEn,
      h1En: DISCLAIMER_SEO.h1En,
      canonicalUrl: DISCLAIMER_SEO.canonicalUrl,
      ogTitleEn: DISCLAIMER_SEO.ogTitleEn,
      ogDescriptionEn: DISCLAIMER_SEO.ogDescriptionEn,
      robotsIndex: true,
      robotsFollow: true,
    },
    create: {
      pageKey: "legal:disclaimer",
      legalPageId: page.id,
      metaTitleEn: DISCLAIMER_SEO.metaTitleEn,
      metaDescriptionEn: DISCLAIMER_SEO.metaDescriptionEn,
      h1En: DISCLAIMER_SEO.h1En,
      canonicalUrl: DISCLAIMER_SEO.canonicalUrl,
      ogTitleEn: DISCLAIMER_SEO.ogTitleEn,
      ogDescriptionEn: DISCLAIMER_SEO.ogDescriptionEn,
      robotsIndex: true,
      robotsFollow: true,
    },
  });

  console.log("Disclaimer updated successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
