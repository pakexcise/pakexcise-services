import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import type { PublicServiceSelect } from "@/server/repositories";
import { pickLocalized } from "@/lib/i18n/content";

type ServiceCardProps = {
  service: PublicServiceSelect;
  locale: string;
  learnMoreLabel: string;
};

export function ServiceCard({ service, locale, learnMoreLabel }: ServiceCardProps) {
  const name = pickLocalized(locale, {
    en: service.nameEn,
    ur: service.nameUr,
  });
  const summary = pickLocalized(locale, {
    en: service.shortDescriptionEn,
    ur: service.shortDescriptionUr,
  });
  const regionName = pickLocalized(locale, {
    en: service.region.nameEn,
    ur: service.region.nameUr,
  });

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardDescription>{regionName}</CardDescription>
        <CardTitle className="text-lg">{name}</CardTitle>
      </CardHeader>
      <CardContent className="mt-auto">
        {summary ? (
          <p className="text-sm text-muted-foreground">{summary}</p>
        ) : null}
        <Button asChild variant="link" className="mt-3 px-0">
          <Link href={`/services/${service.slug}`}>
            {learnMoreLabel}
            <DirectionalArrow />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
