import { PrismaClient } from "@prisma/client";

import {
  TERMS_AND_CONDITIONS_CONTENT_EN,
  TERMS_AND_CONDITIONS_SEO,
} from "../features/legal-pages/lib/content/terms-and-conditions-en";

const prisma = new PrismaClient();

const LAST_UPDATED = new Date("2026-06-24T08:00:00.000Z");

async function main() {
  const page = await prisma.legalPage.findUnique({
    where: { slug: "terms-and-conditions" },
    select: { id: true },
  });

  if (!page) {
    throw new Error(
      "Legal page terms-and-conditions not found. Run npm run db:seed-legal first.",
    );
  }

  await prisma.legalPage.update({
    where: { id: page.id },
    data: {
      titleEn: "Terms and Conditions",
      excerptEn: TERMS_AND_CONDITIONS_SEO.excerptEn,
      contentEn: TERMS_AND_CONDITIONS_CONTENT_EN,
      isPublished: true,
      isActive: true,
      updatedAt: LAST_UPDATED,
    },
  });

  await prisma.seoMeta.upsert({
    where: { legalPageId: page.id },
    update: {
      metaTitleEn: TERMS_AND_CONDITIONS_SEO.metaTitleEn,
      metaDescriptionEn: TERMS_AND_CONDITIONS_SEO.metaDescriptionEn,
      h1En: TERMS_AND_CONDITIONS_SEO.h1En,
      canonicalUrl: TERMS_AND_CONDITIONS_SEO.canonicalUrl,
      ogTitleEn: TERMS_AND_CONDITIONS_SEO.ogTitleEn,
      ogDescriptionEn: TERMS_AND_CONDITIONS_SEO.ogDescriptionEn,
      robotsIndex: true,
      robotsFollow: true,
    },
    create: {
      pageKey: "legal:terms-and-conditions",
      legalPageId: page.id,
      metaTitleEn: TERMS_AND_CONDITIONS_SEO.metaTitleEn,
      metaDescriptionEn: TERMS_AND_CONDITIONS_SEO.metaDescriptionEn,
      h1En: TERMS_AND_CONDITIONS_SEO.h1En,
      canonicalUrl: TERMS_AND_CONDITIONS_SEO.canonicalUrl,
      ogTitleEn: TERMS_AND_CONDITIONS_SEO.ogTitleEn,
      ogDescriptionEn: TERMS_AND_CONDITIONS_SEO.ogDescriptionEn,
      robotsIndex: true,
      robotsFollow: true,
    },
  });

  console.log("Terms and Conditions updated successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
