import { Building2 } from "lucide-react";

import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";import Link from "next/link";
type CityCardProps = {
  city: {
    slug: string;
    nameEn: string;
    descriptionEn?: string | null;
  };
  regionSlug: string;
  locale: string;
  viewLabel: string;
};

export function CityCard({
  city,
  regionSlug,
  locale,
  viewLabel}: CityCardProps) {
  const name = city.nameEn ?? "";

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader>
        <Building2 className="mb-2 size-5 text-primary" aria-hidden="true" />
        <CardTitle className="text-base">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Link
          href={`/regions/${regionSlug}/${city.slug}`}
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
