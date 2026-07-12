"use client";

import Image from "next/image";
import { Car } from "lucide-react";

import { DEFAULT_PLATE_FORMAT_IMAGE_PATH } from "@/features/regions/lib/plate-format-image-paths";
import type { MappedRegionPlateFormatsSection } from "@/features/regions/lib/map-region-plate-formats";
import { Badge } from "@/components/ui/badge";
import { disclaimerBoxClassName } from "@/lib/styles/disclaimer-banner";

import Link from "next/link";
type RegionNumberPlateFormatsSectionProps = {
  data: MappedRegionPlateFormatsSection;
  relatedServices: Array<{ slug: string; name: string }>;
  labels: {
    formatsLabel: string;
    relatedServicesLabel: string;
    featuredBadge: string;
    disclaimer: string;
    vehicleTypes: Record<string, string>;
    fallbackImageAlt: string;
  };
};

function resolveRelatedServices(
  slugs: string[],
  available: Array<{ slug: string; name: string }>,
): Array<{ slug: string; name: string }> {
  if (slugs.length === 0) {
    return available.slice(0, 3);
  }

  const lookup = new Map(available.map((service) => [service.slug, service]));
  return slugs
    .map((slug) => lookup.get(slug))
    .filter((service): service is { slug: string; name: string } => Boolean(service));
}

export function RegionNumberPlateFormatsSection({
  data,
  relatedServices,
  labels,
}: RegionNumberPlateFormatsSectionProps) {
  return (
    <section className="space-y-6" aria-labelledby="region-plate-formats-title">
      <div className="space-y-3">
        <h2 id="region-plate-formats-title" className="text-2xl font-bold">
          {data.title}
        </h2>
        <p className="max-w-3xl text-muted-foreground">{data.description}</p>
        <p className={disclaimerBoxClassName}>{labels.disclaimer}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {data.formats.map((format) => {
          const cardServices = resolveRelatedServices(
            format.relatedServiceSlugs,
            relatedServices,
          );
          const imageSrc = format.imageUrl ?? DEFAULT_PLATE_FORMAT_IMAGE_PATH;
          const imageAlt =
            format.imageAlt ??
            format.imageCaption ??
            `${format.title} — ${labels.fallbackImageAlt}`;

          return (
            <article
              key={format.id}
              className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm"
            >
              <div className="relative aspect-[2/1] bg-muted/30">
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-contain p-4"
                />
              </div>

              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    {labels.vehicleTypes[format.vehicleType] ?? format.vehicleType}
                  </Badge>
                  {format.isFeatured ? (
                    <Badge>{labels.featuredBadge}</Badge>
                  ) : null}
                </div>

                <h3 className="text-lg font-semibold">{format.title}</h3>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {labels.formatsLabel}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {format.formats.map((item) => (
                      <li
                        key={item}
                        className="inline-flex w-full items-center gap-2 rounded-md bg-muted/40 px-3 py-1.5 font-mono text-sm"
                      >
                        <Car className="size-4 shrink-0 text-primary" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {format.description ? (
                  <p className="text-sm text-muted-foreground">{format.description}</p>
                ) : null}

                {format.imageCaption ? (
                  <p className="text-xs text-muted-foreground">{format.imageCaption}</p>
                ) : null}

                {cardServices.length > 0 ? (
                  <div className="mt-auto border-t pt-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {labels.relatedServicesLabel}
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {cardServices.map((service) => (
                        <li key={service.slug}>
                          <Link
                            href={`/services/${service.slug}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {service.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {data.faqItems.length > 0 ? (
        <div className="rounded-xl border p-5">
          <div className="space-y-4">
            {data.faqItems.map((item) => (
              <div key={item.question}>
                <h3 className="font-medium">{item.question}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
