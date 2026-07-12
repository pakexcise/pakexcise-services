import type { AdminServiceDetail } from "@/server/repositories/admin-service-repository";

export type ServiceEditorValues = {
  slug: string;
  categoryId: string;
  parentServiceId: string;
  regionIds: string[];
  nameEn: string;
  shortDescriptionEn: string;
  contentEn: string;
  ctaTextEn: string;
  processingNotesEn: string;
  internalNotes: string;
  referenceLinksJson: string;
  requiresProof: boolean;
  isActive: boolean;
  isFeatured: boolean;
  featuredDisplayOrder: number;
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

export function emptyServiceEditorValues(
  regionIds: string[] = [],
  displayOrder = 0,
): ServiceEditorValues {
  return {
    slug: "",
    categoryId: "",
    parentServiceId: "",
    regionIds,
    nameEn: "",
    shortDescriptionEn: "",
    contentEn: "",
    ctaTextEn: "",
    processingNotesEn: "",
    internalNotes: "",
    referenceLinksJson: "",
    requiresProof: true,
    isActive: true,
    isFeatured: false,
    featuredDisplayOrder: 0,
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
  if (value === null || value === undefined) {
    return "";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

export function serviceToEditorValues(
  service: AdminServiceDetail,
): ServiceEditorValues {
  return {
    slug: service.slug,
    categoryId: service.categoryId ?? "",
    parentServiceId: service.parentServiceId ?? "",
    regionIds: service.serviceRegions.map((entry) => entry.regionId),
    nameEn: service.nameEn,
    shortDescriptionEn: service.shortDescriptionEn ?? "",
    contentEn: service.contentEn ?? "",
    ctaTextEn: service.ctaTextEn ?? "",
    processingNotesEn: service.processingNotesEn ?? "",
    internalNotes: service.internalNotes ?? "",
    referenceLinksJson: jsonToString(service.referenceLinksJson),
    requiresProof: service.requiresProof,
    isActive: service.isActive,
    isFeatured: service.isFeatured,
    featuredDisplayOrder: service.featuredDisplayOrder,
    showInFooter: service.showInFooter,
    footerDisplayOrder: service.footerDisplayOrder,
    displayOrder: service.displayOrder,
    seo: {
      metaTitleEn: service.seoMeta?.metaTitleEn ?? "",
      metaDescriptionEn: service.seoMeta?.metaDescriptionEn ?? "",
      h1En: service.seoMeta?.h1En ?? "",
      canonicalUrl: service.seoMeta?.canonicalUrl ?? "",
      ogTitleEn: service.seoMeta?.ogTitleEn ?? "",
      ogDescriptionEn: service.seoMeta?.ogDescriptionEn ?? "",
      ogImage: service.seoMeta?.ogImage ?? "",
      twitterCard:
        service.seoMeta?.twitterCard === "summary"
          ? "summary"
          : "summary_large_image",
      robotsIndex: service.seoMeta?.robotsIndex ?? true,
      robotsFollow: service.seoMeta?.robotsFollow ?? true,
      faqSchemaJson: jsonToString(service.seoMeta?.faqSchemaJson),
      breadcrumbJson: jsonToString(service.seoMeta?.breadcrumbJson),
    },
  };
}

export function parseOptionalJson(
  value: string,
): Record<string, unknown> | unknown[] | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed: unknown = JSON.parse(trimmed);

  if (
    typeof parsed === "object" &&
    parsed !== null &&
    (Array.isArray(parsed) || !Array.isArray(parsed))
  ) {
    return parsed as Record<string, unknown> | unknown[];
  }

  throw new Error("JSON must be an object or array");
}

export function editorValuesToPayload(values: ServiceEditorValues) {
  return {
    ...values,
    categoryId: values.categoryId || null,
    parentServiceId: values.parentServiceId || null,
    shortDescriptionEn: values.shortDescriptionEn || null,
    contentEn: values.contentEn || null,
    ctaTextEn: values.ctaTextEn || null,
    processingNotesEn: values.processingNotesEn || null,
    internalNotes: values.internalNotes || null,
    referenceLinksJson: parseOptionalJson(values.referenceLinksJson),
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
