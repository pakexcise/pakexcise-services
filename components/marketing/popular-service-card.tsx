import { Sparkles } from "lucide-react";

import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { getServiceCardDisplayText } from "@/features/services/lib/service-regions";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/i18n/content";
import { cn } from "@/lib/utils";
import type { PublicServiceSelect } from "@/server/repositories";

import type { ServiceCardLabels } from "@/components/marketing/service-card";

type PopularServiceCardProps = {
  service: PublicServiceSelect;
  locale: string;
  labels: ServiceCardLabels;
  badgeLabel: string;
};

export function PopularServiceCard({
  service,
  locale,
  labels,
  badgeLabel,
}: PopularServiceCardProps) {
  const name = pickLocalized(locale, {
    en: service.nameEn,
    ur: service.nameUr,
  });

  const { availabilityLine, summary } = getServiceCardDisplayText(
    service,
    locale as "en" | "ur",
    {
      allProvincesLabel: labels.allProvincesLabel,
      conjunction: labels.conjunction,
      availableInTemplate: labels.availableInTemplate,
      summaryTemplate: labels.summaryTemplate,
    },
  );

  const fallbackSummary = pickLocalized(locale, {
    en: service.shortDescriptionEn,
    ur: service.shortDescriptionUr,
  });
  const description = summary || fallbackSummary;

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <article
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-2xl border border-primary/15",
          "bg-linear-to-br from-primary/[0.07] via-card to-secondary/[0.08]",
          "p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md sm:p-6",
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/90 px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {badgeLabel}
          </span>
          {service.category ? (
            <span className="text-xs font-medium text-muted-foreground">
              {pickLocalized(locale, {
                en: service.category.nameEn,
                ur: service.category.nameUr,
              })}
            </span>
          ) : null}
        </div>

        <h3 className="text-xl font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
          {name}
        </h3>

        {availabilityLine ? (
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-primary/80">
            {availabilityLine}
          </p>
        ) : null}

        {description ? (
          <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {description}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
          {labels.learnMoreLabel}
          <DirectionalArrow className="size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </span>
      </article>
    </Link>
  );
}
