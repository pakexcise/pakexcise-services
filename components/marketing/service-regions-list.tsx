import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/i18n/content";

type RegionItem = {
  slug: string;
  nameEn: string;
  nameUr: string;
};

type ServiceRegionsListProps = {
  title: string;
  regions: RegionItem[];
  locale: string;
};

export function ServiceRegionsList({
  title,
  regions,
  locale,
}: ServiceRegionsListProps) {
  if (regions.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold">{title}</h2>
      <ul className="flex flex-wrap gap-2">
        {regions.map((region) => (
          <li key={region.slug}>
            <Link
              href={`/regions/${region.slug}`}
              className="inline-flex rounded-full border bg-muted/40 px-3 py-1 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
            >
              {pickLocalized(locale, {
                en: region.nameEn,
                ur: region.nameUr,
              })}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
