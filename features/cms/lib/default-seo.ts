import type { SeoMetaInput } from "@/lib/validations/admin-seo";

export const emptySeoInput: SeoMetaInput = {
  metaTitleEn: "",
  metaTitleUr: "",
  metaDescriptionEn: "",
  metaDescriptionUr: "",
  h1En: "",
  h1Ur: "",
  canonicalUrl: "",
  ogTitleEn: "",
  ogTitleUr: "",
  ogDescriptionEn: "",
  ogDescriptionUr: "",
  ogImage: "",
  twitterCard: "summary_large_image",
  robotsIndex: true,
  robotsFollow: true,
  faqSchemaJson: null,
  breadcrumbJson: null,
};

export function seoFromRecord(
  seo?: {
    metaTitleEn?: string | null;
    metaTitleUr?: string | null;
    metaDescriptionEn?: string | null;
    metaDescriptionUr?: string | null;
    h1En?: string | null;
    h1Ur?: string | null;
    canonicalUrl?: string | null;
    ogTitleEn?: string | null;
    ogTitleUr?: string | null;
    ogDescriptionEn?: string | null;
    ogDescriptionUr?: string | null;
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
    metaTitleUr: seo.metaTitleUr ?? "",
    metaDescriptionEn: seo.metaDescriptionEn ?? "",
    metaDescriptionUr: seo.metaDescriptionUr ?? "",
    h1En: seo.h1En ?? "",
    h1Ur: seo.h1Ur ?? "",
    canonicalUrl: seo.canonicalUrl ?? "",
    ogTitleEn: seo.ogTitleEn ?? "",
    ogTitleUr: seo.ogTitleUr ?? "",
    ogDescriptionEn: seo.ogDescriptionEn ?? "",
    ogDescriptionUr: seo.ogDescriptionUr ?? "",
    ogImage: seo.ogImage ?? "",
    twitterCard:
      seo.twitterCard === "summary" ? "summary" : "summary_large_image",
    robotsIndex: seo.robotsIndex ?? true,
    robotsFollow: seo.robotsFollow ?? true,
    faqSchemaJson: seo.faqSchemaJson ?? null,
    breadcrumbJson: seo.breadcrumbJson ?? null,
  };
}
