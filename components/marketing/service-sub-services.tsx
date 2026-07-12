import { DirectionalArrow } from "@/components/shared/directional-arrow";
import type { PublicServiceDetail } from "@/server/repositories/service-repository";

import Link from "next/link";
type ServiceSubServicesProps = {
  title: string;
  description: string;
  services: PublicServiceDetail["subServices"];
  locale: string;
  applyLabel: string;
};

export function ServiceSubServices({
  title,
  description,
  services,
  locale,
  applyLabel}: ServiceSubServicesProps) {
  if (services.length === 0) {
    return null;
  }

  return (
    <section id="sub-services" className="space-y-4 scroll-mt-24">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {services.map((service) => {
          const name = service.nameEn ?? "";
          const summary = service.shortDescriptionEn ?? "";

          return (
            <article
              key={service.id}
              className="rounded-xl border bg-card p-4 shadow-sm"
            >
              <h3 className="font-semibold">{name}</h3>
              {summary ? (
                <p className="mt-2 text-sm text-muted-foreground">{summary}</p>
              ) : null}
              <Link
                href={`/apply/${service.slug}`}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {applyLabel}
                <DirectionalArrow />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
