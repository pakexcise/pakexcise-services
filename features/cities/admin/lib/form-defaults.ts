import type { AdminCityDetail } from "@/server/repositories/admin-city-repository";
import {
  parseOptionalJson,
  type RegionEditorValues} from "@/features/regions/admin/lib/form-defaults";

export type CityEditorValues = {
  regionId: string;
  slug: string;
  nameEn: string;
  descriptionEn: string;
  isActive: boolean;
  displayOrder: number;
  seo: RegionEditorValues["seo"];
};

export function emptyCityEditorValues(displayOrder = 0): CityEditorValues {
  return {
    regionId: "",
    slug: "",
    nameEn: "",
    descriptionEn: "",
    isActive: true,
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
      breadcrumbJson: ""}};
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
    descriptionEn: city.descriptionEn ?? "",
    isActive: city.isActive,
    displayOrder: city.displayOrder,
    seo: {
      metaTitleEn: city.seoMeta?.metaTitleEn ?? "",
      metaDescriptionEn: city.seoMeta?.metaDescriptionEn ?? "",
      h1En: city.seoMeta?.h1En ?? "",
      canonicalUrl: city.seoMeta?.canonicalUrl ?? "",
      ogTitleEn: city.seoMeta?.ogTitleEn ?? "",
      ogDescriptionEn: city.seoMeta?.ogDescriptionEn ?? "",
      ogImage: city.seoMeta?.ogImage ?? "",
      twitterCard:
        city.seoMeta?.twitterCard === "summary"
          ? "summary"
          : "summary_large_image",
      robotsIndex: city.seoMeta?.robotsIndex ?? true,
      robotsFollow: city.seoMeta?.robotsFollow ?? true,
      faqSchemaJson: jsonToString(city.seoMeta?.faqSchemaJson),
      breadcrumbJson: jsonToString(city.seoMeta?.breadcrumbJson)}};
}

export function editorValuesToCityPayload(values: CityEditorValues) {
  return {
    regionId: values.regionId,
    slug: values.slug,
    nameEn: values.nameEn,
    descriptionEn: values.descriptionEn || null,
    isActive: values.isActive,
    displayOrder: values.displayOrder,
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
      breadcrumbJson: parseOptionalJson(values.seo.breadcrumbJson)}};
}
