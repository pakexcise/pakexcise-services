import { ServiceGrid } from "@/components/marketing/service-grid";
import { ProseContent } from "@/components/marketing/prose-content";
import { pickLocalized } from "@/lib/i18n/content";
import { cn } from "@/lib/utils";
import type { PublicServiceCategoryGroup } from "@/server/repositories/service-category-repository";

type ServiceCategorySectionProps = {
  group: PublicServiceCategoryGroup;
  locale: string;
  learnMoreLabel: string;
  multipleRegionsLabel: string;
  allProvincesLabel: string;
  showRegionLabel?: boolean;
  heading?: "h2" | "h3";
  compact?: boolean;
};

export function ServiceCategorySection({
  group,
  locale,
  learnMoreLabel,
  multipleRegionsLabel,
  allProvincesLabel,
  showRegionLabel = true,
  heading = "h2",
  compact = false,
}: ServiceCategorySectionProps) {
  const title = pickLocalized(locale, {
    en: group.nameEn,
    ur: group.nameUr,
  });
  const description = pickLocalized(locale, {
    en: group.descriptionEn,
    ur: group.descriptionUr,
  });

  const HeadingTag = heading;

  return (
    <section
      id={heading === "h2" ? `category-${group.slug}` : undefined}
      className={cn(
        "scroll-mt-28",
        compact ? "space-y-4" : "space-y-5",
      )}
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <HeadingTag
            className={cn(
              "font-bold tracking-tight",
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
        learnMoreLabel={learnMoreLabel}
        multipleRegionsLabel={multipleRegionsLabel}
        allProvincesLabel={allProvincesLabel}
        showRegionLabel={showRegionLabel}
        variant="elevated"
      />
    </section>
  );
}
