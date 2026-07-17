"use client";

import { MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import Link from "next/link";
const SEARCH_THRESHOLD = 6;

export type RegionCityLink = {
  id: string;
  slug: string;
  name: string;
};

type RegionCitiesSectionLabels = {
  title: string;
  citiesCount: string;
  description: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  noMatch: string;
  viewCity: string;
};

type RegionCitiesSectionProps = {
  cities: RegionCityLink[];
  regionSlug: string;
  labels: RegionCitiesSectionLabels;
};

export function RegionCitiesSection({
  cities,
  regionSlug,
  labels,
}: RegionCitiesSectionProps) {
  const [query, setQuery] = useState("");
  const showSearch = cities.length >= SEARCH_THRESHOLD;

  const filteredCities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return cities;
    }

    return cities.filter((city) =>
      city.name.toLowerCase().includes(normalizedQuery),
    );
  }, [cities, query]);

  return (
    <section
      className="rounded-2xl border border-border/80 bg-muted/25 p-5 md:p-6"
      aria-labelledby="region-cities-heading"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2
              id="region-cities-heading"
              className="text-2xl font-bold tracking-tight sm:text-3xl"
            >
              {labels.title}
            </h2>
            <Badge variant="secondary" className="font-normal">
              {labels.citiesCount}
            </Badge>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {labels.description}
          </p>
        </div>

        {showSearch ? (
          <div className="relative w-full shrink-0 lg:max-w-xs">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={labels.searchPlaceholder}
              aria-label={labels.searchAriaLabel}
              className="ps-9"
            />
          </div>
        ) : null}
      </div>

      {filteredCities.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground" role="status">
          {labels.noMatch}
        </p>
      ) : (
        <ul
          className={cn(
            "mt-4 grid list-none gap-2",
            "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
          )}
        >
          {filteredCities.map((city) => (
            <li key={city.id}>
              <Link
                href={`/regions/${regionSlug}/${city.slug}`}
                prefetch={false}
                aria-label={`${labels.viewCity}: ${city.name}`}
                className="group flex min-h-10 items-center gap-2 rounded-lg border border-border/80 bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                <MapPin
                  className="size-3.5 shrink-0 text-primary/70 transition-colors group-hover:text-primary"
                  aria-hidden="true"
                />
                <span className="truncate">{city.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
