import { redirect } from "next/navigation";
import type { Metadata, Route } from "next";
import { getTranslations } from "@/lib/i18n/t";
import { notFound } from "next/navigation";

import { getCanonicalRegionSlug } from "@/features/regions/lib/resolve-region-slug";

import { RegionHelpSection } from "@/components/marketing/region-help-section";
import { RegionNumberPlateFormatsSection } from "@/components/marketing/region-number-plate-formats-section";
import { RegionCitiesSection } from "@/components/marketing/region-cities-section";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { PublicReviewsSection } from "@/components/marketing/public-reviews-section";
import { RelatedServices } from "@/components/marketing/related-services";
import { mapRegionPlateFormatsSection } from "@/features/regions/lib/map-region-plate-formats";
import { mapFaqsForLocale } from "@/features/marketing/lib/map-faqs";
import { buildServiceCardLabels } from "@/features/marketing/lib/build-service-card-labels";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo, resolveVisibleH1 } from "@/features/seo/lib/resolve-metadata";
import {
  getBusinessSettings,
  getFeatureFlagSettings,
} from "@/features/settings/lib/public-settings-cache";
import {
  resolveWhatsappDefaultMessage,
  resolveWhatsappLinkNumber,
} from "@/features/settings/lib/resolve-public-contact";
import { absoluteUrl } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-service-message";
import {
  cityRepository,
  faqRepository,
  regionRepository,
  regionPlateFormatRepository,
  reviewRepository,
  serviceRepository,
} from "@/server/repositories";
export const revalidate = 3600;

type RegionPageProps = {
  params: Promise<{ regionSlug: string }>;
};

export async function generateMetadata({
  params,
}: RegionPageProps): Promise<Metadata> {
  const { regionSlug } = await params;
  const locale = "en";
  const canonicalSlug = getCanonicalRegionSlug(regionSlug);
  const region = await regionRepository.findPublicBySlug(canonicalSlug);

  if (!region) {
    return {};
  }

  return await resolveMetadataFromSeo({
    locale,
    path: `/regions/${region.slug}`,
    seo: region.seoMeta,
    fallbacks: {
      title: {
        en: `${region.nameEn} Services | PakExcise.com`,
      },
      description: {
        en: region.descriptionEn ?? region.nameEn,
      },
      h1: {
        en: region.nameEn,
      },
    },
  });
}

export default async function RegionDetailPage({ params }: RegionPageProps) {
  const { regionSlug } = await params;
  const locale = "en";
    const canonicalSlug = getCanonicalRegionSlug(regionSlug);

  if (canonicalSlug !== regionSlug) {
    redirect(`/regions/${canonicalSlug}` as Route);
  }

  const region = await regionRepository.findPublicBySlug(canonicalSlug);

  if (!region) {
    notFound();
  }

  const t = await getTranslations("marketing");
  const tCommon = await getTranslations("common");
  const [services, cities, faqs, business, plateBundle, featureFlags] = await Promise.all([
    serviceRepository.listPublicByRegionId(region.id),
    cityRepository.listPublicByRegionId(region.id),
    faqRepository.listPublic(),
    getBusinessSettings(),
    regionPlateFormatRepository.findPublicByRegionId(region.id),
    getFeatureFlagSettings(),
  ]);
  const serviceIds = services.map((service) => service.id);
  const [reviews, reviewSummary] = await Promise.all([
    reviewRepository.listPublicForServices(serviceIds, 3),
    reviewRepository.getPublicSummaryForServices(serviceIds),
  ]);

  const whatsappLinkNumber = resolveWhatsappLinkNumber(business);
  const whatsappMessage = resolveWhatsappDefaultMessage(business, locale);
  const whatsappHref = buildWhatsAppUrl(whatsappLinkNumber, whatsappMessage);

  const name = region.nameEn ?? "";
  const heroTitle = resolveVisibleH1(region.seoMeta, name);
  const description = region.descriptionEn ?? "";

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
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: t("regions.title"), url: absoluteUrl("/regions") },
    { name, url: absoluteUrl(`/regions/${region.slug}`) },
  ]);
  const faqJsonLd = buildFaqJsonLd(combinedFaqItems);
  const jsonLd = [breadcrumbJsonLd, faqJsonLd].filter(
    (item): item is NonNullable<typeof item> => item !== null,
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        title={heroTitle}
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
              name: service.nameEn ?? "",
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
          <RegionCitiesSection
            regionSlug={region.slug}
            cities={cities.map((city) => ({
              id: city.id,
              slug: city.slug,
              name: city.nameEn ?? "",
            }))}
            labels={{
              title: t("regions.citiesTitle"),
              citiesCount: t("regions.citiesCount", { count: cities.length }),
              description: t("regions.citiesDescription"),
              searchPlaceholder: t("regions.searchCities"),
              searchAriaLabel: t("regions.searchCitiesAria"),
              noMatch: t("regions.noCitiesMatch"),
              viewCity: t("regions.viewCity"),
            }}
          />
        ) : null}

        <FaqAccordion
          title={t("faqs.title")}
          items={combinedFaqItems}
          emptyMessage={t("faqs.empty")}
        />

        {featureFlags.reviewsEnabled ? (
          <PublicReviewsSection
            reviews={reviews}
            title={t("reviews.homeTitle")}
            description={t("reviews.homeDescription")}
            feedbackLabel={t("reviews.feedbackLabel")}
            customerLabel={t("reviews.customerLabel")}
            googleLabel={t("reviews.googleLabel")}
            countLabel={t("reviews.ratingSummary", { count: reviewSummary.count })}
            averageRating={reviewSummary.averageRating}
            viewAllLabel={t("reviews.viewAll")}
            googleReviewHref={process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL?.trim() || undefined}
            googleReviewLabel={t("reviews.googleReviewCta")}
            tone="muted"
          />
        ) : null}

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
