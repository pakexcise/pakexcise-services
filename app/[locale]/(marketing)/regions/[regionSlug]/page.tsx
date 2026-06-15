import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { redirect } from "@/i18n/navigation";
import { getCanonicalRegionSlug } from "@/features/regions/lib/resolve-region-slug";

import { CTASection } from "@/components/marketing/cta-section";
import { CityCard } from "@/components/marketing/city-card";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { RelatedServices } from "@/components/marketing/related-services";
import { mapFaqsForLocale } from "@/features/marketing/lib/map-faqs";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { getBusinessSettings } from "@/features/settings/lib/public-settings-cache";
import { pickLocalized } from "@/lib/i18n/content";
import { absoluteUrl } from "@/lib/utils";
import {
  cityRepository,
  faqRepository,
  regionRepository,
  serviceRepository,
} from "@/server/repositories";
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
  const canonicalSlug = getCanonicalRegionSlug(regionSlug);
  const region = await regionRepository.findPublicBySlug(canonicalSlug);

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

  const canonicalSlug = getCanonicalRegionSlug(regionSlug);

  if (canonicalSlug !== regionSlug) {
    redirect({ href: `/regions/${canonicalSlug}`, locale });
  }

  const region = await regionRepository.findPublicBySlug(canonicalSlug);

  if (!region) {
    notFound();
  }

  const t = await getTranslations("marketing");
  const tCommon = await getTranslations("common");
  const [services, cities, faqs, business] = await Promise.all([
    serviceRepository.listPublicByRegionId(region.id),
    cityRepository.listPublicByRegionId(region.id),
    faqRepository.listPublic(),
    getBusinessSettings(),
  ]);

  const name = pickLocalized(locale, {
    en: region.nameEn,
    ur: region.nameUr,
  });
  const description = pickLocalized(locale, {
    en: region.descriptionEn,
    ur: region.descriptionUr,
  });

  const faqItems = mapFaqsForLocale(faqs.slice(0, 6), locale);
  const faqJsonLd = faqItems.length > 0 ? buildFaqJsonLd(faqItems) : null;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: t("regions.title"), url: absoluteUrl("/regions") },
    { name, url: absoluteUrl(`/regions/${region.slug}`) },
  ]);

  return (
    <>
      <JsonLd data={faqJsonLd ? [breadcrumbJsonLd, faqJsonLd] : breadcrumbJsonLd} />
      <PageHero
        title={name}
        description={description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: t("regions.title"), href: "/regions" },
          { label: name },
        ]}
      />
      <div className="container-site space-y-12 py-10 md:py-12">
        <RelatedServices
          title={t("regions.servicesInRegion")}
          services={services}
          locale={locale}
          learnMoreLabel={tCommon("learnMore")}
          multipleRegionsLabel={t("services.multipleRegions")}
          allProvincesLabel={t("services.allProvinces")}
          showRegionLabel={false}
          variant="region"
          emptyMessage={t("regions.emptyServices")}
          serviceCountLabel={t("regions.serviceCount", { count: services.length })}
        />

        {cities.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t("regions.citiesTitle")}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cities.map((city) => (
                <CityCard
                  key={city.id}
                  city={city}
                  regionSlug={region.slug}
                  locale={locale}
                  viewLabel={t("regions.viewCity")}
                />
              ))}
            </div>
          </section>
        ) : null}

        <FaqAccordion
          title={t("faqs.title")}
          items={faqItems}
          emptyMessage={t("faqs.empty")}
        />

        <CTASection
          title={t("service.ctaTitle")}
          description={t("service.ctaDescription")}
          applyLabel={t("service.applyNow")}
          applyHref="/services"
          whatsappLabel={tCommon("whatsappHelp")}
          whatsappPhone={business.whatsappNumber}
          whatsappMessage={business.whatsappDefaultMessage}
        />
      </div>
    </>
  );
}
