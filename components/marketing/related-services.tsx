import type { PublicServiceCard } from "@/server/repositories/service-repository";

import { ServiceGrid } from "@/components/marketing/service-grid";
import type { ServiceCardLabels } from "@/components/marketing/service-card";
import { cn } from "@/lib/utils";

type RelatedServicesProps = {
  title: string;
  services: PublicServiceCard[];
  locale: string;
  labels: ServiceCardLabels;
  useDynamicSummary?: boolean;
  variant?: "default" | "region";
  emptyMessage?: string;
  serviceCountLabel?: string;
  regionSlug?: string;
};

export function RelatedServices({
  title,
  services,
  locale,
  labels,
  useDynamicSummary = true,
  variant = "default",
  emptyMessage,
  serviceCountLabel,
  regionSlug,
}: RelatedServicesProps) {
  if (services.length === 0) {
    return emptyMessage ? (
      <section className="space-y-3">
        <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </section>
    ) : null;
  }

  const isRegionContext = variant === "region";

  return (
    <section
      className={cn(
        "space-y-6",
        isRegionContext &&
          "rounded-2xl border border-border/80 bg-muted/25 p-6 md:p-8",
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2
          className={cn(
            "font-bold tracking-tight",
            isRegionContext ? "text-2xl sm:text-3xl" : "text-2xl",
          )}
        >
          {title}
        </h2>
        {serviceCountLabel ? (
          <span className="text-sm text-muted-foreground">{serviceCountLabel}</span>
        ) : null}
      </div>
      <ServiceGrid
        services={services}
        locale={locale}
        labels={labels}
        useDynamicSummary={useDynamicSummary}
        variant="elevated"
        regionSlug={regionSlug}
      />
    </section>
  );
}
