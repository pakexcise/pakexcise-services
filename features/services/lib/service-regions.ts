import type { PublicServiceSelect } from "@/server/repositories/base/repository";
import type { Locale } from "@/i18n/config";
import { CANONICAL_PROVINCE_SLUGS } from "@/config/region-slugs";
import { pickLocalized } from "@/lib/i18n/content";

type RegionRef = {
  slug: string;
  nameEn: string;
  nameUr: string;
};

type RegionListLabels = {
  conjunction: string;
};

export function getServiceAssignedRegions(
  service: Pick<PublicServiceSelect, "serviceRegions">,
): RegionRef[] {
  return (service.serviceRegions ?? [])
    .map((entry) => entry.region)
    .filter((region): region is RegionRef => Boolean(region));
}

export function serviceCoversAllProvinces(
  service: Pick<PublicServiceSelect, "serviceRegions">,
): boolean {
  const assignedSlugs = new Set(
    getServiceAssignedRegions(service).map((region) => region.slug),
  );

  return CANONICAL_PROVINCE_SLUGS.every((slug) => assignedSlugs.has(slug));
}

function localizeRegionName(region: RegionRef, locale: Locale): string {
  return pickLocalized(locale, {
    en: region.nameEn,
    ur: region.nameUr,
  });
}

export function formatRegionList(
  regions: RegionRef[],
  locale: Locale,
  labels: RegionListLabels,
): string {
  const names = regions.map((region) => localizeRegionName(region, locale));

  if (names.length === 0) {
    return "";
  }

  if (names.length === 1) {
    return names[0] ?? "";
  }

  if (names.length === 2) {
    return `${names[0]} ${labels.conjunction} ${names[1]}`;
  }

  const head = names.slice(0, -1).join(", ");
  const tail = names[names.length - 1];
  return `${head} ${labels.conjunction} ${tail}`;
}

export function getServiceProvinceListText(
  service: Pick<PublicServiceSelect, "serviceRegions">,
  locale: Locale,
  allProvincesLabel: string,
  labels: RegionListLabels,
): string {
  const regions = getServiceAssignedRegions(service);

  if (regions.length === 0) {
    return "";
  }

  if (serviceCoversAllProvinces(service)) {
    return allProvincesLabel;
  }

  return formatRegionList(regions, locale, labels);
}

export function getServiceRegionLabel(
  service: Pick<PublicServiceSelect, "serviceRegions">,
  locale: Locale,
  multipleLabel: string,
  allProvincesLabel: string,
  labels?: RegionListLabels,
): string {
  const regions = getServiceAssignedRegions(service);

  if (regions.length === 0) {
    return "";
  }

  if (regions.length === 1) {
    const region = regions[0];
    if (!region) {
      return "";
    }

    return localizeRegionName(region, locale);
  }

  if (serviceCoversAllProvinces(service)) {
    return allProvincesLabel;
  }

  if (labels) {
    return formatRegionList(regions, locale, labels);
  }

  return multipleLabel;
}

export const SERVICE_CARD_TEMPLATE_TOKENS = {
  provinces: "__PROVINCES__",
  serviceName: "__SERVICE_NAME__",
} as const;

type ServiceCardTextLabels = RegionListLabels & {
  allProvincesLabel: string;
  availableInTemplate: string;
  summaryTemplate: string;
};

export function getServiceCardDisplayText(
  service: Pick<
    PublicServiceSelect,
    "nameEn" | "nameUr" | "shortDescriptionEn" | "shortDescriptionUr" | "serviceRegions"
  >,
  locale: Locale,
  labels: ServiceCardTextLabels,
): {
  availabilityLine: string;
  summary: string;
} {
  const serviceName = pickLocalized(locale, {
    en: service.nameEn,
    ur: service.nameUr,
  });
  const provinces = getServiceProvinceListText(
    service,
    locale,
    labels.allProvincesLabel,
    labels,
  );

  const availabilityLine = provinces
    ? labels.availableInTemplate.replace(SERVICE_CARD_TEMPLATE_TOKENS.provinces, provinces)
    : "";

  const summary = labels.summaryTemplate
    .replace(SERVICE_CARD_TEMPLATE_TOKENS.serviceName, serviceName)
    .replace(SERVICE_CARD_TEMPLATE_TOKENS.provinces, provinces);

  return { availabilityLine, summary };
}
