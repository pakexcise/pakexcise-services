import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { HomeSectionShell } from "@/components/marketing/home-section-shell";
import { SectionHeader } from "@/components/marketing/section-header";
import { ServiceCategorySection } from "@/components/marketing/service-category-section";
import type { ServiceCardLabels } from "@/components/marketing/service-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PublicServiceCategoryGroup } from "@/server/repositories/service-category-repository";

import Link from "next/link";
type HomeServicesSectionProps = {
  title: string;
  description: string;
  categoryGroups: PublicServiceCategoryGroup[];
  locale: string;
  labels: ServiceCardLabels;
  viewAllLabel: string;
  emptyMessage: string;
  emptyActionLabel: string;
  tone?: "default" | "muted" | "accent";
};

export function HomeServicesSection({
  title,
  description,
  categoryGroups,
  locale,
  labels,
  viewAllLabel,
  emptyMessage,
  emptyActionLabel,
  tone = "muted",
}: HomeServicesSectionProps) {
  const hasServices = categoryGroups.length > 0;

  return (
    <HomeSectionShell tone={tone}>
      <SectionHeader
        title={title}
        description={description}
        action={
          <Button asChild variant="ghost" className="hidden shrink-0 sm:inline-flex">
            <Link href="/services">
              {viewAllLabel}
              <DirectionalArrow />
            </Link>
          </Button>
        }
      />

      {!hasServices ? (
        <Card className="mt-8 border-dashed bg-background/60">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{emptyMessage}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/contact">{emptyActionLabel}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-8 md:space-y-10">
          {categoryGroups.map((group) => (
            <ServiceCategorySection
              key={group.id}
              group={group}
              locale={locale}
              labels={labels}
              heading="h3"
              layout="compact"
            />
          ))}
        </div>
      )}
    </HomeSectionShell>
  );
}
