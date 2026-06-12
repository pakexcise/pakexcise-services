import type { PublicServiceCard } from "@/server/repositories/service-repository";

import { ServiceGrid } from "@/components/marketing/service-grid";

type RelatedServicesProps = {
  title: string;
  services: PublicServiceCard[];
  locale: string;
  learnMoreLabel: string;
  multipleRegionsLabel: string;
  allProvincesLabel: string;
};

export function RelatedServices({
  title,
  services,
  locale,
  learnMoreLabel,
  multipleRegionsLabel,
  allProvincesLabel,
}: RelatedServicesProps) {
  if (services.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <ServiceGrid
        services={services}
        locale={locale}
        learnMoreLabel={learnMoreLabel}
        multipleRegionsLabel={multipleRegionsLabel}
        allProvincesLabel={allProvincesLabel}
      />
    </section>
  );
}
