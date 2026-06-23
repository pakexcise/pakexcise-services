import { PrismaClient } from "@prisma/client";

import {
  REFUND_POLICY_CONTENT_EN,
  REFUND_POLICY_SEO,
} from "../features/legal-pages/lib/content/refund-policy-en";

const prisma = new PrismaClient();

const LAST_UPDATED = new Date("2026-06-24T08:00:00.000Z");

async function main() {
  const page = await prisma.legalPage.findUnique({
    where: { slug: "refund-policy" },
    select: { id: true },
  });

  if (!page) {
    throw new Error("Legal page refund-policy not found. Run npm run db:seed-legal first.");
  }

  await prisma.legalPage.update({
    where: { id: page.id },
    data: {
      titleEn: "Refund Policy",
      excerptEn: REFUND_POLICY_SEO.excerptEn,
      contentEn: REFUND_POLICY_CONTENT_EN,
      isPublished: true,
      isActive: true,
      updatedAt: LAST_UPDATED,
    },
  });

  await prisma.seoMeta.upsert({
    where: { legalPageId: page.id },
    update: {
      metaTitleEn: REFUND_POLICY_SEO.metaTitleEn,
      metaDescriptionEn: REFUND_POLICY_SEO.metaDescriptionEn,
      h1En: REFUND_POLICY_SEO.h1En,
      canonicalUrl: REFUND_POLICY_SEO.canonicalUrl,
      ogTitleEn: REFUND_POLICY_SEO.ogTitleEn,
      ogDescriptionEn: REFUND_POLICY_SEO.ogDescriptionEn,
      robotsIndex: true,
      robotsFollow: true,
    },
    create: {
      pageKey: "legal:refund-policy",
      legalPageId: page.id,
      metaTitleEn: REFUND_POLICY_SEO.metaTitleEn,
      metaDescriptionEn: REFUND_POLICY_SEO.metaDescriptionEn,
      h1En: REFUND_POLICY_SEO.h1En,
      canonicalUrl: REFUND_POLICY_SEO.canonicalUrl,
      ogTitleEn: REFUND_POLICY_SEO.ogTitleEn,
      ogDescriptionEn: REFUND_POLICY_SEO.ogDescriptionEn,
      robotsIndex: true,
      robotsFollow: true,
    },
  });

  console.log("Refund Policy updated successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
