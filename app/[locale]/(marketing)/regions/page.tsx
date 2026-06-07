import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin } from "lucide-react";

import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildBreadcrumbJsonLd } from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/i18n/content";
import { absoluteUrl } from "@/lib/utils";
import { regionRepository, seoMetaRepository } from "@/server/repositories";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const t = await getTranslations({ locale, namespace: "marketing" });
  const seo = await seoMetaRepository.findByPageKey("regions");

  return resolveMetadataFromSeo({
    locale,
    path: "/regions",
    seo,
    fallbacks: {
      title: {
        en: t("regions.metaTitle"),
        ur: t("regions.metaTitle"),
      },
      description: {
        en: t("regions.metaDescription"),
        ur: t("regions.metaDescription"),
      },
      h1: {
        en: t("regions.title"),
        ur: t("regions.title"),
      },
    },
  });
}

export default async function RegionsPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("marketing");
  const seo = await seoMetaRepository.findByPageKey("regions");
  const regions = await regionRepository.listPublic();

  const title = pickLocalized(locale, {
    en: seo?.h1En ?? t("regions.title"),
    ur: seo?.h1Ur ?? t("regions.title"),
  });
  const description = pickLocalized(locale, {
    en: seo?.metaDescriptionEn ?? t("regions.metaDescription"),
    ur: seo?.metaDescriptionUr ?? t("regions.metaDescription"),
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: title, url: absoluteUrl("/regions") },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <PageHero
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: title },
        ]}
      />
      <div className="container-site py-10 md:py-12">
        {regions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("regions.empty")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {regions.map((region) => {
              const name = pickLocalized(locale, {
                en: region.nameEn,
                ur: region.nameUr,
              });
              const regionDescription = pickLocalized(locale, {
                en: region.descriptionEn,
                ur: region.descriptionUr,
              });

              return (
                <Card key={region.id} className="h-full">
                  <CardHeader>
                    <MapPin
                      className="mb-2 size-5 text-primary"
                      aria-hidden="true"
                    />
                    <CardTitle>{name}</CardTitle>
                    {regionDescription ? (
                      <CardDescription>{regionDescription}</CardDescription>
                    ) : null}
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline">
                      <Link href={`/regions/${region.slug}`}>
                        {t("regions.viewServices")}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
