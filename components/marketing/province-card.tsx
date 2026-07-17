import { MapPin } from "lucide-react";

import { DirectionalArrow } from "@/components/shared/directional-arrow";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle} from "@/components/ui/card";
import Link from "next/link";
type ProvinceCardProps = {
  region: {
    slug: string;
    nameEn: string;
    descriptionEn?: string | null;
  };
  locale: string;
  viewLabel: string;
  serviceCount?: number;
  serviceCountLabel?: string;
};

export function ProvinceCard({
  region,
  locale,
  viewLabel,
  serviceCount,
  serviceCountLabel}: ProvinceCardProps) {
  const name = region.nameEn ?? "";
  const description = region.descriptionEn ?? "";

  return (
    <Card className="h-full border-border/70 bg-background/80 transition-colors hover:border-primary/25 hover:bg-primary/[0.02]">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <MapPin className="size-5 shrink-0 text-primary" aria-hidden="true" />
          {typeof serviceCount === "number" && serviceCountLabel ? (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {serviceCountLabel}
            </span>
          ) : null}
        </div>
        <CardTitle className="text-lg">{name}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <Link
          href={`/regions/${region.slug}`}
          prefetch={false}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {viewLabel}
          <DirectionalArrow />
        </Link>
      </CardContent>
    </Card>
  );
}
