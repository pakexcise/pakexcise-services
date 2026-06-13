import type { Locale } from "@/i18n/config";
import { getServiceRegionLabel } from "@/features/services/lib/service-regions";
import type { ApplyServiceOption } from "@/features/applications/types";
import { pickLocalized } from "@/lib/i18n/content";
import type { PublicServiceSelect } from "@/server/repositories";

export function mapServiceApplyOption(
  service: PublicServiceSelect,
  locale: Locale,
  regionLabels: { multiple: string; allProvinces: string },
): ApplyServiceOption {
  return {
    id: service.id,
    slug: service.slug,
    name: pickLocalized(locale, {
      en: service.nameEn,
      ur: service.nameUr,
    }),
    region: getServiceRegionLabel(
      service,
      locale,
      regionLabels.multiple,
      regionLabels.allProvinces,
    ),
    shortDescription:
      service.shortDescriptionEn || service.shortDescriptionUr
        ? pickLocalized(locale, {
            en: service.shortDescriptionEn ?? "",
            ur: service.shortDescriptionUr ?? service.shortDescriptionEn ?? "",
          })
        : null,
  };
}
