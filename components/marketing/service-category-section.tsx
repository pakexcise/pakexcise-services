import { ServiceCompactCard } from "@/components/marketing/service-compact-card";
import type { ServiceCardLabels } from "@/components/marketing/service-card";
import { ServiceGrid } from "@/components/marketing/service-grid";
import { ProseContent } from "@/components/marketing/prose-content";
import { cn } from "@/lib/utils";
import type { PublicServiceCategoryGroup } from "@/server/repositories/service-category-repository";

type ServiceCategorySectionProps = {
  group: PublicServiceCategoryGroup;
  locale: string;
  labels: ServiceCardLabels;
  useDynamicSummary?: boolean;
  heading?: "h2" | "h3";
  compact?: boolean;
  layout?: "grid" | "compact";
};

export function ServiceCategorySection({
  group,
  locale,
  labels,
  useDynamicSummary = true,
  heading = "h2",
  compact = false,
  layout}: ServiceCategorySectionProps) {
  const resolvedLayout = layout ?? (compact ? "compact" : "grid");
  const title = group.nameEn ?? "";
  const description = group.descriptionEn ?? "";

  const HeadingTag = heading;

  if (resolvedLayout === "compact") {
    return (
      <section
        id={heading === "h2" ? `category-${group.slug}` : undefined}
        className="scroll-mt-28 rounded-xl border border-border/60 bg-background/80 p-4 sm:p-5"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="space-y-1">
            <HeadingTag className="text-bidi-auto text-lg font-semibold leading-relaxed tracking-normal sm:text-xl">
              {title}
            </HeadingTag>
            {description ? (
              <ProseContent
                content={description}
                className="text-bidi-auto max-w-3xl text-sm leading-relaxed text-muted-foreground line-clamp-2"
              />
            ) : null}
          </div>
          <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {group.services.length}
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {group.services.map((service) => (
            <ServiceCompactCard
              key={service.id}
              service={service}
              locale={locale}
              labels={labels}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id={heading === "h2" ? `category-${group.slug}` : undefined}
      className={cn("scroll-mt-28", compact ? "space-y-4" : "space-y-5")}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <HeadingTag
            className={cn(
              "text-bidi-auto font-bold leading-relaxed tracking-normal",
              heading === "h2" ? "text-2xl" : "text-xl",
            )}
          >
            {title}
          </HeadingTag>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {group.services.length}
          </span>
        </div>
        {description ? (
          <ProseContent
            content={description}
            className="max-w-3xl text-sm text-muted-foreground line-clamp-2"
          />
        ) : null}
      </div>
      <ServiceGrid
        services={group.services}
        locale={locale}
        labels={labels}
        useDynamicSummary={useDynamicSummary}
        variant="elevated"
      />
    </section>
  );
}
