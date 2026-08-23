import Link from "next/link";
import { MapPin } from "lucide-react";

import { buildServiceRegionPath } from "@/features/services/lib/service-region-pages";

type RegionItem = {
  slug: string;
  nameEn: string;
};

type ServiceRegionHubCardsProps = {
  title: string;
  description: string;
  serviceSlug: string;
  regions: RegionItem[];
  viewLabel: string;
};

export function ServiceRegionHubCards({
  title,
  description,
  serviceSlug,
  regions,
  viewLabel,
}: ServiceRegionHubCardsProps) {
  if (regions.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {regions.map((region) => (
          <li key={region.slug}>
            <Link
              href={buildServiceRegionPath(serviceSlug, region.slug)}
              prefetch={false}
              className="flex h-full items-start gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary hover:bg-primary/5"
            >
              <span className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
                <MapPin className="size-4" aria-hidden="true" />
              </span>
              <span className="space-y-1">
                <span className="block font-semibold">{region.nameEn}</span>
                <span className="block text-sm text-primary">{viewLabel}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
