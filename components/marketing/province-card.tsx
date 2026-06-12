import { MapPin } from "lucide-react";

import { DirectionalArrow } from "@/components/shared/directional-arrow";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/i18n/content";

type ProvinceCardProps = {
  region: {
    slug: string;
    nameEn: string;
    nameUr: string;
    descriptionEn?: string | null;
    descriptionUr?: string | null;
  };
  locale: string;
  viewLabel: string;
};

export function ProvinceCard({ region, locale, viewLabel }: ProvinceCardProps) {
  const name = pickLocalized(locale, { en: region.nameEn, ur: region.nameUr });
  const description = pickLocalized(locale, {
    en: region.descriptionEn,
    ur: region.descriptionUr,
  });

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader>
        <MapPin className="mb-2 size-5 text-primary" aria-hidden="true" />
        <CardTitle className="text-lg">{name}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <Link
          href={`/regions/${region.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {viewLabel}
          <DirectionalArrow />
        </Link>
      </CardContent>
    </Card>
  );
}
