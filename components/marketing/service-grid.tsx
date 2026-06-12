import type { PublicServiceCard } from "@/server/repositories/service-repository";

import { ServiceCard } from "@/components/marketing/service-card";

type ServiceGridProps = {
  services: PublicServiceCard[];
  locale: string;
  learnMoreLabel: string;
  multipleRegionsLabel: string;
  allProvincesLabel: string;
  emptyMessage?: string;
};

export function ServiceGrid({
  services,
  locale,
  learnMoreLabel,
  multipleRegionsLabel,
  allProvincesLabel,
  emptyMessage,
}: ServiceGridProps) {
  if (services.length === 0) {
    return emptyMessage ? (
      <p className="text-sm text-muted-foreground">{emptyMessage}</p>
    ) : null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          locale={locale}
          learnMoreLabel={learnMoreLabel}
          multipleRegionsLabel={multipleRegionsLabel}
          allProvincesLabel={allProvincesLabel}
        />
      ))}
    </div>
  );
}
