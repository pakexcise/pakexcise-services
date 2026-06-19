import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { redirect } from "@/i18n/navigation";
import { getCanonicalRegionSlug } from "@/features/regions/lib/resolve-region-slug";

import { RegionHelpSection } from "@/components/marketing/region-help-section";
import { RegionNumberPlateFormatsSection } from "@/components/marketing/region-number-plate-formats-section";
import { CityCard } from "@/components/marketing/city-card";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { RelatedServices } from "@/components/marketing/related-services";
import { mapRegionPlateFormatsSection } from "@/features/regions/lib/map-region-plate-formats";
import { mapFaqsForLocale } from "@/features/marketing/lib/map-faqs";
import { buildServiceCardLabels } from "@/features/marketing/lib/build-service-card-labels";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { getBusinessSettings } from "@/features/settings/lib/public-settings-cache";
import {
  resolveWhatsappDefaultMessage,
  resolveWhatsappLinkNumber,
} from "@/features/settings/lib/resolve-public-contact";
import { pickLocalized } from "@/lib/i18n/content";
import { absoluteUrl } from "@/lib/utils";
import {
  cityRepository,
  faqRepository,
  regionRepository,
  regionPlateFormatRepository,
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
  const [services, cities, faqs, business, plateBundle] = await Promise.all([
    serviceRepository.listPublicByRegionId(region.id),
    cityRepository.listPublicByRegionId(region.id),
    faqRepository.listPublic(),
    getBusinessSettings(),
    regionPlateFormatRepository.findPublicByRegionId(region.id),
  ]);

  const whatsappLinkNumber = resolveWhatsappLinkNumber(business);
  const whatsappMessage = resolveWhatsappDefaultMessage(business, locale);

  const name = pickLocalized(locale, {
    en: region.nameEn,
    ur: region.nameUr,
  });
  const description = pickLocalized(locale, {
    en: region.descriptionEn,
    ur: region.descriptionUr,
  });

  const faqItems = mapFaqsForLocale(faqs.slice(0, 6), locale);
  const plateFormatsSection = mapRegionPlateFormatsSection({
    regionName: name,
    section: plateBundle.section,
    formats: plateBundle.formats,
    locale,
    fallbacks: {
      sectionTitle: t("regions.plateFormats.sectionTitle"),
      sectionDescription: t("regions.plateFormats.sectionDescription"),
    },
  });
  const plateFaqItems = plateFormatsSection?.faqItems ?? [];
  const combinedFaqItems = [
    ...plateFaqItems.map((item, index) => ({
      id: `region-plate-faq-${index}`,
      question: item.question,
      answer: item.answer,
    })),
    ...faqItems,
  ].slice(0, 8);
  const faqJsonLd = combinedFaqItems.length > 0 ? buildFaqJsonLd(combinedFaqItems) : null;
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
          labels={buildServiceCardLabels(tCommon, t)}
          variant="region"
          emptyMessage={t("regions.emptyServices")}
          serviceCountLabel={t("regions.serviceCount", { count: services.length })}
        />

        {plateFormatsSection ? (
          <RegionNumberPlateFormatsSection
            data={plateFormatsSection}
            relatedServices={services.map((service) => ({
              slug: service.slug,
              name: pickLocalized(locale, {
                en: service.nameEn,
                ur: service.nameUr,
              }),
            }))}
            labels={{
              formatsLabel: t("regions.plateFormats.formatsLabel"),
              relatedServicesLabel: t("regions.plateFormats.relatedServicesLabel"),
              featuredBadge: t("regions.plateFormats.featuredBadge"),
              disclaimer: t("regions.plateFormats.disclaimer"),
              fallbackImageAlt: t("regions.plateFormats.fallbackImageAlt"),
              vehicleTypes: {
                CAR: t("regions.plateFormats.vehicleTypes.CAR"),
                MOTORCYCLE: t("regions.plateFormats.vehicleTypes.MOTORCYCLE"),
                PUBLIC_TRANSPORT: t("regions.plateFormats.vehicleTypes.PUBLIC_TRANSPORT"),
                COMMERCIAL: t("regions.plateFormats.vehicleTypes.COMMERCIAL"),
                GOVERNMENT: t("regions.plateFormats.vehicleTypes.GOVERNMENT"),
                OTHER: t("regions.plateFormats.vehicleTypes.OTHER"),
              },
            }}
          />
        ) : null}

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
          items={combinedFaqItems}
          emptyMessage={t("faqs.empty")}
        />

        <RegionHelpSection
          regionName={name}
          whatsappPhone={whatsappLinkNumber}
          whatsappDefaultMessage={whatsappMessage}
          locale={locale}
          labels={{
            title: t("regions.regionHelp.title", { region: name }),
            description: t("regions.regionHelp.description"),
            whatsappCta: t("serviceOptions.whatsappCta"),
            browseServicesCta: t("regions.regionHelp.browseServices"),
          }}
        />
      </div>
    </>
  );
}
