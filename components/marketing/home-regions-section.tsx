import { copy, createT } from "@/messages";
import { MapPin } from "lucide-react";
import { getTranslations } from "@/lib/i18n/t";

import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { HomeSectionShell } from "@/components/marketing/home-section-shell";
import { ProvinceCard } from "@/components/marketing/province-card";
import { SectionHeader } from "@/components/marketing/section-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
type HomeRegionsSectionProps = {
  title: string;
  description: string;
  regions: Array<{
    slug: string;
    nameEn: string;
    descriptionEn?: string | null;
    activeServiceCount?: number;
  }>;
  locale: string;
  viewLabel: string;
  viewAllLabel: string;
  emptyMessage: string;
  tone?: "default" | "muted" | "accent";
  className?: string;
};

export async function HomeRegionsSection({
  title,
  description,
  regions,
  locale,
  viewLabel,
  viewAllLabel,
  emptyMessage,
  tone = "default",
  className}: HomeRegionsSectionProps) {
  const t = createT(copy.marketing);

  return (
    <HomeSectionShell tone={tone} className={className}>
      <SectionHeader
        title={title}
        description={description}
        action={
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/regions">
              {viewAllLabel}
              <DirectionalArrow />
            </Link>
          </Button>
        }
      />

      {regions.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {regions.map((region) => (
            <ProvinceCard
              key={region.slug}
              region={region}
              locale={locale}
              viewLabel={viewLabel}
              serviceCount={region.activeServiceCount}
              serviceCountLabel={
                typeof region.activeServiceCount === "number"
                  ? t("regions.serviceCount", { count: region.activeServiceCount })
                  : undefined
              }
            />
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground sm:hidden">
        <MapPin className="size-4" aria-hidden="true" />
        <Button asChild variant="outline" size="sm">
          <Link href="/regions">
            {viewAllLabel}
            <DirectionalArrow />
          </Link>
        </Button>
      </div>
    </HomeSectionShell>
  );
}
