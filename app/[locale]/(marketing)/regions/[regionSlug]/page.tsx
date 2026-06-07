import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { ServiceCard } from "@/components/marketing/service-card";
import { buildBreadcrumbJsonLd } from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { pickLocalized } from "@/lib/i18n/content";
import { absoluteUrl } from "@/lib/utils";
import { regionRepository, serviceRepository } from "@/server/repositories";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export const revalidate = 3600;

type RegionPageProps = {
  params: Promise<{ regionSlug: string }>;
};

export async function generateMetadata({
  params,
}: RegionPageProps): Promise<Metadata> {
  const { regionSlug } = await params;
  const locale = await getCurrentLocale();
  const region = await regionRepository.findPublicBySlug(regionSlug);

  if (!region) {
    return {};
  }

  return resolveMetadataFromSeo({
    locale,
    path: `/regions/${region.slug}`,
    seo: region.seoMeta,
    fallbacks: {
      title: {
        en: `${region.nameEn} Services | PakExcise.com`,
        ur: `${region.nameUr} خدمات | PakExcise.com`,
      },
      description: {
        en: region.descriptionEn ?? region.nameEn,
        ur: region.descriptionUr ?? region.nameUr,
      },
      h1: {
        en: region.nameEn,
        ur: region.nameUr,
      },
    },
  });
}

export default async function RegionDetailPage({ params }: RegionPageProps) {
  const { regionSlug } = await params;
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const region = await regionRepository.findPublicBySlug(regionSlug);

  if (!region) {
    notFound();
  }

  const t = await getTranslations("marketing");
  const tCommon = await getTranslations("common");
  const services = await serviceRepository.listPublicByRegionId(region.id);

  const name = pickLocalized(locale, {
    en: region.nameEn,
    ur: region.nameUr,
  });
  const description = pickLocalized(locale, {
    en: region.descriptionEn,
    ur: region.descriptionUr,
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: t("regions.title"), url: absoluteUrl("/regions") },
    { name, url: absoluteUrl(`/regions/${region.slug}`) },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <PageHero
        title={name}
        description={description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: t("regions.title"), href: "/regions" },
          { label: name },
        ]}
      />
      <div className="container-site py-10 md:py-12">
        <h2 className="mb-6 text-2xl font-bold">{t("regions.servicesInRegion")}</h2>
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("regions.emptyServices")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                locale={locale}
                learnMoreLabel={tCommon("learnMore")}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
