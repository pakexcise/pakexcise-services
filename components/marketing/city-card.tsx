import { Building2 } from "lucide-react";

import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/i18n/content";

type CityCardProps = {
  city: {
    slug: string;
    nameEn: string;
    nameUr: string;
    descriptionEn?: string | null;
    descriptionUr?: string | null;
  };
  regionSlug: string;
  locale: string;
  viewLabel: string;
};

export function CityCard({
  city,
  regionSlug,
  locale,
  viewLabel,
}: CityCardProps) {
  const name = pickLocalized(locale, { en: city.nameEn, ur: city.nameUr });

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader>
        <Building2 className="mb-2 size-5 text-primary" aria-hidden="true" />
        <CardTitle className="text-base">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Link
          href={`/regions/${regionSlug}/${city.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {viewLabel}
          <DirectionalArrow />
        </Link>
      </CardContent>
    </Card>
  );
}
