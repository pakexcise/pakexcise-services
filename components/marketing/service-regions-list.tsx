import Link from "next/link";
import type { Route } from "next";

import { buildServiceRegionPath } from "@/features/services/lib/service-region-pages";

type RegionItem = {
  slug: string;
  nameEn: string;
};

type ServiceRegionsListProps = {
  title: string;
  regions: RegionItem[];
  serviceSlug?: string;
};

export function ServiceRegionsList({
  title,
  regions,
  serviceSlug,
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
              href={
                serviceSlug
                  ? buildServiceRegionPath(serviceSlug, region.slug)
                  : (`/regions/${region.slug}` as Route)
              }
              prefetch={false}
              className="inline-flex rounded-full border bg-muted/40 px-3 py-1 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
            >
              {region.nameEn ?? ""}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
