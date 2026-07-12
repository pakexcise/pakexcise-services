import { getServiceRegionLabel } from "@/features/services/lib/service-regions";
import type { ApplyServiceOption } from "@/features/applications/types";
import type { PublicServiceSelect } from "@/server/repositories";

type Locale = "en";

export function mapServiceApplyOption(
  service: PublicServiceSelect,
  locale: Locale,
  regionLabels: { multiple: string; allProvinces: string },
): ApplyServiceOption {
  return {
    id: service.id,
    slug: service.slug,
    name: service.nameEn ?? "",
    region: getServiceRegionLabel(
      service,
      locale,
      regionLabels.multiple,
      regionLabels.allProvinces,
    ),
    shortDescription: service.shortDescriptionEn
      ? service.shortDescriptionEn
      : null,
  };
}
