import type { AdminRegionDetail } from "@/server/repositories/admin-region-repository";

export type RegionEditorValues = {
  slug: string;
  nameEn: string;
  nameUr: string;
  descriptionEn: string;
  descriptionUr: string;
  isActive: boolean;
  showInFooter: boolean;
  footerDisplayOrder: number;
  displayOrder: number;
  seo: {
    metaTitleEn: string;
    metaTitleUr: string;
    metaDescriptionEn: string;
    metaDescriptionUr: string;
    h1En: string;
    h1Ur: string;
    canonicalUrl: string;
    ogTitleEn: string;
    ogTitleUr: string;
    ogDescriptionEn: string;
    ogDescriptionUr: string;
    ogImage: string;
    twitterCard: "summary" | "summary_large_image";
    robotsIndex: boolean;
    robotsFollow: boolean;
    faqSchemaJson: string;
    breadcrumbJson: string;
  };
};

export function emptyRegionEditorValues(displayOrder = 0): RegionEditorValues {
  return {
    slug: "",
    nameEn: "",
    nameUr: "",
    descriptionEn: "",
    descriptionUr: "",
    isActive: true,
    showInFooter: false,
    footerDisplayOrder: 0,
    displayOrder,
    seo: {
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
      faqSchemaJson: "",
      breadcrumbJson: "",
    },
  };
}

function jsonToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

export function regionToEditorValues(region: AdminRegionDetail): RegionEditorValues {
  return {
    slug: region.slug,
    nameEn: region.nameEn,
    nameUr: region.nameUr,
    descriptionEn: region.descriptionEn ?? "",
    descriptionUr: region.descriptionUr ?? "",
    isActive: region.isActive,
    showInFooter: region.showInFooter,
    footerDisplayOrder: region.footerDisplayOrder,
    displayOrder: region.displayOrder,
    seo: {
      metaTitleEn: region.seoMeta?.metaTitleEn ?? "",
      metaTitleUr: region.seoMeta?.metaTitleUr ?? "",
      metaDescriptionEn: region.seoMeta?.metaDescriptionEn ?? "",
      metaDescriptionUr: region.seoMeta?.metaDescriptionUr ?? "",
      h1En: region.seoMeta?.h1En ?? "",
      h1Ur: region.seoMeta?.h1Ur ?? "",
      canonicalUrl: region.seoMeta?.canonicalUrl ?? "",
      ogTitleEn: region.seoMeta?.ogTitleEn ?? "",
      ogTitleUr: region.seoMeta?.ogTitleUr ?? "",
      ogDescriptionEn: region.seoMeta?.ogDescriptionEn ?? "",
      ogDescriptionUr: region.seoMeta?.ogDescriptionUr ?? "",
      ogImage: region.seoMeta?.ogImage ?? "",
      twitterCard:
        region.seoMeta?.twitterCard === "summary"
          ? "summary"
          : "summary_large_image",
      robotsIndex: region.seoMeta?.robotsIndex ?? true,
      robotsFollow: region.seoMeta?.robotsFollow ?? true,
      faqSchemaJson: jsonToString(region.seoMeta?.faqSchemaJson),
      breadcrumbJson: jsonToString(region.seoMeta?.breadcrumbJson),
    },
  };
}

export function parseOptionalJson(
  value: string,
): Record<string, unknown> | unknown[] | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed: unknown = JSON.parse(trimmed);
  if (typeof parsed === "object" && parsed !== null) {
    return parsed as Record<string, unknown> | unknown[];
  }
  throw new Error("JSON must be an object or array");
}

export function editorValuesToPayload(values: RegionEditorValues) {
  return {
    ...values,
    descriptionEn: values.descriptionEn || null,
    descriptionUr: values.descriptionUr || null,
    seo: {
      ...values.seo,
      metaTitleEn: values.seo.metaTitleEn || null,
      metaTitleUr: values.seo.metaTitleUr || null,
      metaDescriptionEn: values.seo.metaDescriptionEn || null,
      metaDescriptionUr: values.seo.metaDescriptionUr || null,
      h1En: values.seo.h1En || null,
      h1Ur: values.seo.h1Ur || null,
      canonicalUrl: values.seo.canonicalUrl || null,
      ogTitleEn: values.seo.ogTitleEn || null,
      ogTitleUr: values.seo.ogTitleUr || null,
      ogDescriptionEn: values.seo.ogDescriptionEn || null,
      ogDescriptionUr: values.seo.ogDescriptionUr || null,
      ogImage: values.seo.ogImage || null,
      faqSchemaJson: parseOptionalJson(values.seo.faqSchemaJson),
      breadcrumbJson: parseOptionalJson(values.seo.breadcrumbJson),
    },
  };
}
