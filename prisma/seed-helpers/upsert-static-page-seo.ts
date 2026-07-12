import type { PrismaClient } from "@prisma/client";

import type { SeoMetaInput } from "@/lib/validations/admin-seo";
import { toPrismaNullableJson } from "@/lib/utils/prisma-json";

function normalizeSeoInput(seo: SeoMetaInput) {
  return {
    metaTitleEn: seo.metaTitleEn || null,
    metaDescriptionEn: seo.metaDescriptionEn || null,
    h1En: seo.h1En || null,
    canonicalUrl: seo.canonicalUrl || null,
    ogTitleEn: seo.ogTitleEn || null,
    ogDescriptionEn: seo.ogDescriptionEn || null,
    ogImage: seo.ogImage || null,
    twitterCard: seo.twitterCard ?? "summary_large_image",
    robotsIndex: seo.robotsIndex,
    robotsFollow: seo.robotsFollow,
    faqSchemaJson: toPrismaNullableJson(seo.faqSchemaJson),
    breadcrumbJson: toPrismaNullableJson(seo.breadcrumbJson)};
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
      ...data}});
}
