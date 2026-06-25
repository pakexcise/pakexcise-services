import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { getServiceCardDisplayText } from "@/features/services/lib/service-regions";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/i18n/content";
import { cn } from "@/lib/utils";
import type { PublicServiceSelect } from "@/server/repositories";

import type { ServiceCardLabels } from "@/components/marketing/service-card";

type ServiceCompactCardProps = {
  service: PublicServiceSelect;
  locale: string;
  labels: ServiceCardLabels;
};

export function ServiceCompactCard({
  service,
  locale,
  labels,
}: ServiceCompactCardProps) {
  const name = pickLocalized(locale, {
    en: service.nameEn,
    ur: service.nameUr,
  });

  const { availabilityLine } = getServiceCardDisplayText(
    service,
    locale as "en" | "ur",
    {
      allProvincesLabel: labels.allProvincesLabel,
      conjunction: labels.conjunction,
      availableInTemplate: labels.availableInTemplate,
      summaryTemplate: labels.summaryTemplate,
    },
  );

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <article
        className={cn(
          "flex items-start gap-3 rounded-lg border border-border/70 bg-background/70 px-4 py-3.5",
          "transition-colors hover:border-primary/25 hover:bg-primary/[0.03]",
        )}
      >
        <span
          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <h4 className="text-bidi-auto font-medium leading-relaxed text-foreground transition-colors group-hover:text-primary">
            {name}
          </h4>
          {availabilityLine ? (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {availabilityLine}
            </p>
          ) : null}
        </div>
        <DirectionalArrow className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
      </article>
    </Link>
  );
}
