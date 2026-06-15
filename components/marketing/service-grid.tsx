import type { PublicServiceCard } from "@/server/repositories/service-repository";

import { ServiceCard, type ServiceCardLabels } from "@/components/marketing/service-card";

type ServiceGridProps = {
  services: PublicServiceCard[];
  locale: string;
  labels: ServiceCardLabels;
  useDynamicSummary?: boolean;
  variant?: "default" | "elevated";
  emptyMessage?: string;
};

export function ServiceGrid({
  services,
  locale,
  labels,
  useDynamicSummary = true,
  variant = "elevated",
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
          labels={labels}
          useDynamicSummary={useDynamicSummary}
          variant={variant}
        />
      ))}
    </div>
  );
}
