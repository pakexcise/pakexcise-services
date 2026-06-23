import { PrismaClient } from "@prisma/client";

import {
  PAYMENT_POLICY_CONTENT_EN,
  PAYMENT_POLICY_SEO,
} from "../features/legal-pages/lib/content/payment-policy-en";

const prisma = new PrismaClient();

const LAST_UPDATED = new Date("2026-06-24T08:00:00.000Z");

async function main() {
  const page = await prisma.legalPage.findUnique({
    where: { slug: "payment-policy" },
    select: { id: true },
  });

  if (!page) {
    throw new Error("Legal page payment-policy not found. Run npm run db:seed-legal first.");
  }

  await prisma.legalPage.update({
    where: { id: page.id },
    data: {
      titleEn: "Payment Policy",
      excerptEn: PAYMENT_POLICY_SEO.excerptEn,
      contentEn: PAYMENT_POLICY_CONTENT_EN,
      isPublished: true,
      isActive: true,
      updatedAt: LAST_UPDATED,
    },
  });

  await prisma.seoMeta.upsert({
    where: { legalPageId: page.id },
    update: {
      metaTitleEn: PAYMENT_POLICY_SEO.metaTitleEn,
      metaDescriptionEn: PAYMENT_POLICY_SEO.metaDescriptionEn,
      h1En: PAYMENT_POLICY_SEO.h1En,
      canonicalUrl: PAYMENT_POLICY_SEO.canonicalUrl,
      ogTitleEn: PAYMENT_POLICY_SEO.ogTitleEn,
      ogDescriptionEn: PAYMENT_POLICY_SEO.ogDescriptionEn,
      robotsIndex: true,
      robotsFollow: true,
    },
    create: {
      pageKey: "legal:payment-policy",
      legalPageId: page.id,
      metaTitleEn: PAYMENT_POLICY_SEO.metaTitleEn,
      metaDescriptionEn: PAYMENT_POLICY_SEO.metaDescriptionEn,
      h1En: PAYMENT_POLICY_SEO.h1En,
      canonicalUrl: PAYMENT_POLICY_SEO.canonicalUrl,
      ogTitleEn: PAYMENT_POLICY_SEO.ogTitleEn,
      ogDescriptionEn: PAYMENT_POLICY_SEO.ogDescriptionEn,
      robotsIndex: true,
      robotsFollow: true,
    },
  });

  console.log("Payment Policy updated successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
