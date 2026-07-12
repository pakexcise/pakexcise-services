import type { AdminRegionDetail } from "@/server/repositories/admin-region-repository";

export type RegionEditorValues = {
  slug: string;
  nameEn: string;
  descriptionEn: string;
  isActive: boolean;
  showInFooter: boolean;
  footerDisplayOrder: number;
  displayOrder: number;
  seo: {
    metaTitleEn: string;
    metaDescriptionEn: string;
    h1En: string;
    canonicalUrl: string;
    ogTitleEn: string;
    ogDescriptionEn: string;
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
    descriptionEn: "",
    isActive: true,
    showInFooter: false,
    footerDisplayOrder: 0,
    displayOrder,
    seo: {
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
    descriptionEn: region.descriptionEn ?? "",
    isActive: region.isActive,
    showInFooter: region.showInFooter,
    footerDisplayOrder: region.footerDisplayOrder,
    displayOrder: region.displayOrder,
    seo: {
      metaTitleEn: region.seoMeta?.metaTitleEn ?? "",
      metaDescriptionEn: region.seoMeta?.metaDescriptionEn ?? "",
      h1En: region.seoMeta?.h1En ?? "",
      canonicalUrl: region.seoMeta?.canonicalUrl ?? "",
      ogTitleEn: region.seoMeta?.ogTitleEn ?? "",
      ogDescriptionEn: region.seoMeta?.ogDescriptionEn ?? "",
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
    seo: {
      ...values.seo,
      metaTitleEn: values.seo.metaTitleEn || null,
      metaDescriptionEn: values.seo.metaDescriptionEn || null,
      h1En: values.seo.h1En || null,
      canonicalUrl: values.seo.canonicalUrl || null,
      ogTitleEn: values.seo.ogTitleEn || null,
      ogDescriptionEn: values.seo.ogDescriptionEn || null,
      ogImage: values.seo.ogImage || null,
      faqSchemaJson: parseOptionalJson(values.seo.faqSchemaJson),
      breadcrumbJson: parseOptionalJson(values.seo.breadcrumbJson),
    },
  };
}
