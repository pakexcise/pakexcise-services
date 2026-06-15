import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { PopularServiceCard } from "@/components/marketing/popular-service-card";
import { SectionHeader } from "@/components/marketing/section-header";
import { HomeSectionShell } from "@/components/marketing/home-section-shell";
import type { ServiceCardLabels } from "@/components/marketing/service-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { PublicServiceSelect } from "@/server/repositories";

type HomePopularServicesSectionProps = {
  title: string;
  description: string;
  services: PublicServiceSelect[];
  locale: string;
  labels: ServiceCardLabels;
  badgeLabel: string;
  viewAllLabel: string;
  emptyMessage: string;
  tone?: "default" | "muted" | "accent";
};

export function HomePopularServicesSection({
  title,
  description,
  services,
  locale,
  labels,
  badgeLabel,
  viewAllLabel,
  emptyMessage,
  tone = "accent",
}: HomePopularServicesSectionProps) {
  return (
    <HomeSectionShell tone={tone}>
      <SectionHeader
        title={title}
        description={description}
        action={
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/services">
              {viewAllLabel}
              <DirectionalArrow />
            </Link>
          </Button>
        }
      />

      {services.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <PopularServiceCard
              key={service.id}
              service={service}
              locale={locale}
              labels={labels}
              badgeLabel={badgeLabel}
            />
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-center sm:hidden">
        <Button asChild variant="outline">
          <Link href="/services">
            {viewAllLabel}
            <DirectionalArrow />
          </Link>
        </Button>
      </div>
    </HomeSectionShell>
  );
}
