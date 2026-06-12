import type { PublicServiceSelect } from "@/server/repositories/base/repository";
import type { Locale } from "@/i18n/config";
import { CANONICAL_PROVINCE_SLUGS } from "@/config/region-slugs";
import { pickLocalized } from "@/lib/i18n/content";

type RegionRef = {
  slug: string;
  nameEn: string;
  nameUr: string;
};

export function getServiceAssignedRegions(
  service: Pick<PublicServiceSelect, "serviceRegions">,
): RegionRef[] {
  return service.serviceRegions
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

export function getServiceRegionLabel(
  service: Pick<PublicServiceSelect, "serviceRegions">,
  locale: Locale,
  multipleLabel: string,
  allProvincesLabel: string,
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

    return pickLocalized(locale, {
      en: region.nameEn,
      ur: region.nameUr,
    });
  }

  if (serviceCoversAllProvinces(service)) {
    return allProvincesLabel;
  }

  return multipleLabel;
}
