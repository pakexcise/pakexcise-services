import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

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
import { requireGuidesEnabled } from "@/features/settings/lib/feature-gates";
import { guideRepository, seoMetaRepository } from "@/server/repositories";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const t = await getTranslations({ locale, namespace: "marketing" });
  const seo = await seoMetaRepository.findByPageKey("guides");

  return resolveMetadataFromSeo({
    locale,
    path: "/guides",
    seo,
    fallbacks: {
      title: {
        en: t("guides.metaTitle"),
        ur: t("guides.metaTitle"),
      },
      description: {
        en: t("guides.metaDescription"),
        ur: t("guides.metaDescription"),
      },
      h1: {
        en: t("guides.title"),
        ur: t("guides.title"),
      },
    },
  });
}

export default async function GuidesPage() {
  await requireGuidesEnabled();
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("marketing");
  const tCommon = await getTranslations("common");
  const seo = await seoMetaRepository.findByPageKey("guides");
  const guides = await guideRepository.listPublished();

  const title = pickLocalized(locale, {
    en: seo?.h1En ?? t("guides.title"),
    ur: seo?.h1Ur ?? t("guides.title"),
  });
  const description = pickLocalized(locale, {
    en: seo?.metaDescriptionEn ?? t("guides.metaDescription"),
    ur: seo?.metaDescriptionUr ?? t("guides.metaDescription"),
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: title, url: absoluteUrl("/guides") },
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
        {guides.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("guides.empty")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {guides.map((guide) => {
              const guideTitle = pickLocalized(locale, {
                en: guide.titleEn,
                ur: guide.titleUr,
              });
              const excerpt = pickLocalized(locale, {
                en: guide.excerptEn,
                ur: guide.excerptUr,
              });

              return (
                <Card key={guide.id} className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{guideTitle}</CardTitle>
                    {excerpt ? <CardDescription>{excerpt}</CardDescription> : null}
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="link" className="px-0">
                      <Link href={`/guides/${guide.slug}`}>
                        {tCommon("learnMore")}
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
