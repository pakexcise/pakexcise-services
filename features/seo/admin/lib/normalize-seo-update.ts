import type { SeoMetaInput } from "@/lib/validations/admin-seo";
import { toPrismaNullableJson } from "@/lib/utils/prisma-json";

export function normalizeSeoInputForUpdate(seo: SeoMetaInput) {
  return {
    metaTitleEn: seo.metaTitleEn || null,
    metaDescriptionEn: seo.metaDescriptionEn || null,
    h1En: seo.h1En || null,
    focusKeywords: seo.focusKeywords || null,
    canonicalUrl: seo.canonicalUrl || null,
    ogTitleEn: seo.ogTitleEn || null,
    ogDescriptionEn: seo.ogDescriptionEn || null,
    ogImage: seo.ogImage || null,
    twitterCard: seo.twitterCard ?? "summary_large_image",
    robotsIndex: seo.robotsIndex,
    robotsFollow: seo.robotsFollow,
    faqSchemaJson: toPrismaNullableJson(seo.faqSchemaJson),
    breadcrumbJson: toPrismaNullableJson(seo.breadcrumbJson),
  };
}
