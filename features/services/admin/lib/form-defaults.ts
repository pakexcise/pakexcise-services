import type { AdminServiceDetail } from "@/server/repositories/admin-service-repository";

export type ServiceEditorValues = {
  slug: string;
  categoryId: string;
  parentServiceId: string;
  regionIds: string[];
  nameEn: string;
  nameUr: string;
  shortDescriptionEn: string;
  shortDescriptionUr: string;
  contentEn: string;
  contentUr: string;
  ctaTextEn: string;
  ctaTextUr: string;
  processingNotesEn: string;
  processingNotesUr: string;
  internalNotes: string;
  referenceLinksJson: string;
  requiresProof: boolean;
  isActive: boolean;
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
    nameUr: "",
    shortDescriptionEn: "",
    shortDescriptionUr: "",
    contentEn: "",
    contentUr: "",
    ctaTextEn: "",
    ctaTextUr: "",
    processingNotesEn: "",
    processingNotesUr: "",
    internalNotes: "",
    referenceLinksJson: "",
    requiresProof: true,
    isActive: true,
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
    nameUr: service.nameUr,
    shortDescriptionEn: service.shortDescriptionEn ?? "",
    shortDescriptionUr: service.shortDescriptionUr ?? "",
    contentEn: service.contentEn ?? "",
    contentUr: service.contentUr ?? "",
    ctaTextEn: service.ctaTextEn ?? "",
    ctaTextUr: service.ctaTextUr ?? "",
    processingNotesEn: service.processingNotesEn ?? "",
    processingNotesUr: service.processingNotesUr ?? "",
    internalNotes: service.internalNotes ?? "",
    referenceLinksJson: jsonToString(service.referenceLinksJson),
    requiresProof: service.requiresProof,
    isActive: service.isActive,
    displayOrder: service.displayOrder,
    seo: {
      metaTitleEn: service.seoMeta?.metaTitleEn ?? "",
      metaTitleUr: service.seoMeta?.metaTitleUr ?? "",
      metaDescriptionEn: service.seoMeta?.metaDescriptionEn ?? "",
      metaDescriptionUr: service.seoMeta?.metaDescriptionUr ?? "",
      h1En: service.seoMeta?.h1En ?? "",
      h1Ur: service.seoMeta?.h1Ur ?? "",
      canonicalUrl: service.seoMeta?.canonicalUrl ?? "",
      ogTitleEn: service.seoMeta?.ogTitleEn ?? "",
      ogTitleUr: service.seoMeta?.ogTitleUr ?? "",
      ogDescriptionEn: service.seoMeta?.ogDescriptionEn ?? "",
      ogDescriptionUr: service.seoMeta?.ogDescriptionUr ?? "",
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
    shortDescriptionUr: values.shortDescriptionUr || null,
    contentEn: values.contentEn || null,
    contentUr: values.contentUr || null,
    ctaTextEn: values.ctaTextEn || null,
    ctaTextUr: values.ctaTextUr || null,
    processingNotesEn: values.processingNotesEn || null,
    processingNotesUr: values.processingNotesUr || null,
    internalNotes: values.internalNotes || null,
    referenceLinksJson: parseOptionalJson(values.referenceLinksJson),
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
