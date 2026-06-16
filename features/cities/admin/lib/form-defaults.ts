import type { AdminCityDetail } from "@/server/repositories/admin-city-repository";
import {
  parseOptionalJson,
  type RegionEditorValues,
} from "@/features/regions/admin/lib/form-defaults";

export type CityEditorValues = {
  regionId: string;
  slug: string;
  nameEn: string;
  nameUr: string;
  descriptionEn: string;
  descriptionUr: string;
  isActive: boolean;
  displayOrder: number;
  seo: RegionEditorValues["seo"];
};

export function emptyCityEditorValues(displayOrder = 0): CityEditorValues {
  return {
    regionId: "",
    slug: "",
    nameEn: "",
    nameUr: "",
    descriptionEn: "",
    descriptionUr: "",
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
  if (value === null || value === undefined) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

export function cityToEditorValues(city: AdminCityDetail): CityEditorValues {
  return {
    regionId: city.regionId,
    slug: city.slug,
    nameEn: city.nameEn,
    nameUr: city.nameUr,
    descriptionEn: city.descriptionEn ?? "",
    descriptionUr: city.descriptionUr ?? "",
    isActive: city.isActive,
    displayOrder: city.displayOrder,
    seo: {
      metaTitleEn: city.seoMeta?.metaTitleEn ?? "",
      metaTitleUr: city.seoMeta?.metaTitleUr ?? "",
      metaDescriptionEn: city.seoMeta?.metaDescriptionEn ?? "",
      metaDescriptionUr: city.seoMeta?.metaDescriptionUr ?? "",
      h1En: city.seoMeta?.h1En ?? "",
      h1Ur: city.seoMeta?.h1Ur ?? "",
      canonicalUrl: city.seoMeta?.canonicalUrl ?? "",
      ogTitleEn: city.seoMeta?.ogTitleEn ?? "",
      ogTitleUr: city.seoMeta?.ogTitleUr ?? "",
      ogDescriptionEn: city.seoMeta?.ogDescriptionEn ?? "",
      ogDescriptionUr: city.seoMeta?.ogDescriptionUr ?? "",
      ogImage: city.seoMeta?.ogImage ?? "",
      twitterCard:
        city.seoMeta?.twitterCard === "summary"
          ? "summary"
          : "summary_large_image",
      robotsIndex: city.seoMeta?.robotsIndex ?? true,
      robotsFollow: city.seoMeta?.robotsFollow ?? true,
      faqSchemaJson: jsonToString(city.seoMeta?.faqSchemaJson),
      breadcrumbJson: jsonToString(city.seoMeta?.breadcrumbJson),
    },
  };
}

export function editorValuesToCityPayload(values: CityEditorValues) {
  return {
    regionId: values.regionId,
    slug: values.slug,
    nameEn: values.nameEn,
    nameUr: values.nameUr,
    descriptionEn: values.descriptionEn || null,
    descriptionUr: values.descriptionUr || null,
    isActive: values.isActive,
    displayOrder: values.displayOrder,
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
