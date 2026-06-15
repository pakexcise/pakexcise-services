import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { getServiceCardDisplayText } from "@/features/services/lib/service-regions";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/i18n/content";
import { cn } from "@/lib/utils";
import type { PublicServiceSelect } from "@/server/repositories";

export type ServiceCardLabels = {
  learnMoreLabel: string;
  allProvincesLabel: string;
  conjunction: string;
  availableInTemplate: string;
  summaryTemplate: string;
};

type ServiceCardProps = {
  service: PublicServiceSelect;
  locale: string;
  labels: ServiceCardLabels;
  useDynamicSummary?: boolean;
  variant?: "default" | "elevated";
};

export function ServiceCard({
  service,
  locale,
  labels,
  useDynamicSummary = true,
  variant = "elevated",
}: ServiceCardProps) {
  const name = pickLocalized(locale, {
    en: service.nameEn,
    ur: service.nameUr,
  });

  const { availabilityLine, summary: dynamicSummary } = getServiceCardDisplayText(
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
  const summary = useDynamicSummary && dynamicSummary ? dynamicSummary : fallbackSummary;

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <article
        className={cn(
          "flex h-full flex-col rounded-xl border bg-card p-5 transition-all",
          variant === "elevated"
            ? "shadow-sm hover:border-primary/35 hover:shadow-md"
            : "hover:border-primary/25",
        )}
      >
        {availabilityLine ? (
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-primary/80">
            {availabilityLine}
          </p>
        ) : null}
        {service.category ? (
          <p className="mb-1 text-xs text-muted-foreground">
            {pickLocalized(locale, {
              en: service.category.nameEn,
              ur: service.category.nameUr,
            })}
          </p>
        ) : null}
        <h3 className="text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
          {name}
        </h3>
        {summary ? (
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {summary}
          </p>
        ) : (
          <div className="flex-1" />
        )}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
          {labels.learnMoreLabel}
          <DirectionalArrow className="size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </span>
      </article>
    </Link>
  );
}
