import type { PrismaClient } from "@prisma/client";

import type { SeoMetaInput } from "@/lib/validations/admin-seo";
import { toPrismaNullableJson } from "@/lib/utils/prisma-json";

function normalizeSeoInput(seo: SeoMetaInput) {
  return {
    metaTitleEn: seo.metaTitleEn || null,
    metaTitleUr: seo.metaTitleUr || null,
    metaDescriptionEn: seo.metaDescriptionEn || null,
    metaDescriptionUr: seo.metaDescriptionUr || null,
    h1En: seo.h1En || null,
    h1Ur: seo.h1Ur || null,
    canonicalUrl: seo.canonicalUrl || null,
    ogTitleEn: seo.ogTitleEn || null,
    ogTitleUr: seo.ogTitleUr || null,
    ogDescriptionEn: seo.ogDescriptionEn || null,
    ogDescriptionUr: seo.ogDescriptionUr || null,
    ogImage: seo.ogImage || null,
    twitterCard: seo.twitterCard ?? "summary_large_image",
    robotsIndex: seo.robotsIndex,
    robotsFollow: seo.robotsFollow,
    faqSchemaJson: toPrismaNullableJson(seo.faqSchemaJson),
    breadcrumbJson: toPrismaNullableJson(seo.breadcrumbJson),
  };
}

export async function seedUpsertStaticPageSeo(
  prisma: PrismaClient,
  pageKey: string,
  seo?: SeoMetaInput,
) {
  if (!seo) {
    return;
  }

  const data = normalizeSeoInput(seo);

  await prisma.seoMeta.upsert({
    where: { pageKey },
    update: data,
    create: {
      pageKey,
      ...data,
    },
  });
}
