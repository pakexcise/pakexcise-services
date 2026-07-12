import type { SeoMetaInput } from "@/lib/validations/admin-seo";

export const emptySeoInput: SeoMetaInput = {
  metaTitleEn: "",
  metaDescriptionEn: "",
  h1En: "",
  canonicalUrl: "",
  ogTitleEn: "",
  ogDescriptionEn: "",
  ogImage: "",
  twitterCard: "summary_large_image",
  robotsIndex: true,
  robotsFollow: true,
  faqSchemaJson: null,
  breadcrumbJson: null};

export function seoFromRecord(
  seo?: {
    metaTitleEn?: string | null;
    metaDescriptionEn?: string | null;
    h1En?: string | null;
    canonicalUrl?: string | null;
    ogTitleEn?: string | null;
    ogDescriptionEn?: string | null;
    ogImage?: string | null;
    twitterCard?: string | null;
    robotsIndex?: boolean;
    robotsFollow?: boolean;
    faqSchemaJson?: unknown;
    breadcrumbJson?: unknown;
  } | null,
): SeoMetaInput {
  if (!seo) return { ...emptySeoInput };
  return {
    metaTitleEn: seo.metaTitleEn ?? "",
    metaDescriptionEn: seo.metaDescriptionEn ?? "",
    h1En: seo.h1En ?? "",
    canonicalUrl: seo.canonicalUrl ?? "",
    ogTitleEn: seo.ogTitleEn ?? "",
    ogDescriptionEn: seo.ogDescriptionEn ?? "",
    ogImage: seo.ogImage ?? "",
    twitterCard:
      seo.twitterCard === "summary" ? "summary" : "summary_large_image",
    robotsIndex: seo.robotsIndex ?? true,
    robotsFollow: seo.robotsFollow ?? true,
    faqSchemaJson: (seo.faqSchemaJson ?? null) as SeoMetaInput["faqSchemaJson"],
    breadcrumbJson: (seo.breadcrumbJson ?? null) as SeoMetaInput["breadcrumbJson"]};
}
