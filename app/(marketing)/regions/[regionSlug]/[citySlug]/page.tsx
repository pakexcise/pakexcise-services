import { redirect } from "next/navigation";
import type { Metadata, Route } from "next";
import { getTranslations } from "@/lib/i18n/t";
import { notFound } from "next/navigation";

import { CTASection } from "@/components/marketing/cta-section";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { PublicReviewsSection } from "@/components/marketing/public-reviews-section";
import { RelatedServices } from "@/components/marketing/related-services";
import { mapFaqsForLocale } from "@/features/marketing/lib/map-faqs";
import { buildServiceCardLabels } from "@/features/marketing/lib/build-service-card-labels";
import { getCanonicalRegionSlug } from "@/features/regions/lib/resolve-region-slug";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
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
  reviewRepository,
  serviceRepository,
} from "@/server/repositories";
export const revalidate = 3600;

type CityPageProps = {
  params: Promise<{ regionSlug: string; citySlug: string }>;
};

export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const { regionSlug, citySlug } = await params;
  const locale = "en";
  const canonicalRegionSlug = getCanonicalRegionSlug(regionSlug);
  const city = await cityRepository.findPublicByRegionSlugAndCitySlug(
    canonicalRegionSlug,
    citySlug,
  );

  if (!city) {
    return {};
  }

  return await resolveMetadataFromSeo({
    locale,
    path: `/regions/${city.region.slug}/${city.slug}`,
    seo: city.seoMeta,
    fallbacks: {
      title: {
        en: `${city.nameEn} Excise Services | PakExcise.com`,
      },
      description: {
        en: city.descriptionEn ?? city.nameEn,
      },
      h1: { en: city.nameEn },
    },
  });
}

export default async function CityDetailPage({ params }: CityPageProps) {
  const { regionSlug, citySlug } = await params;
  const locale = "en";
    const canonicalRegionSlug = getCanonicalRegionSlug(regionSlug);

  if (canonicalRegionSlug !== regionSlug) {
    redirect(`/regions/${canonicalRegionSlug}/${citySlug}` as Route);
  }

  const city = await cityRepository.findPublicByRegionSlugAndCitySlug(
    canonicalRegionSlug,
    citySlug,
  );

  if (!city) {
    notFound();
  }

  const region = city.region;

  const t = await getTranslations("marketing");
  const tCommon = await getTranslations("common");
  const [services, faqs, business, featureFlags] = await Promise.all([
    serviceRepository.listPublicByRegionId(region.id),
    faqRepository.listPublic(),
    getBusinessSettings(),
    getFeatureFlagSettings(),
  ]);
  const serviceIds = services.map((service) => service.id);
  const [reviews, reviewSummary] = await Promise.all([
    reviewRepository.listPublicForServices(serviceIds, 3),
    reviewRepository.getPublicSummaryForServices(serviceIds),
  ]);
  const whatsappHref = buildWhatsAppUrl(
    resolveWhatsappLinkNumber(business),
    resolveWhatsappDefaultMessage(business),
  );

  const cityName = city.nameEn ?? "";
  const regionName = region.nameEn ?? "";
  const description = city.descriptionEn ?? "";

  const faqItems = mapFaqsForLocale(faqs.slice(0, 6), locale);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: t("regions.title"), url: absoluteUrl("/regions") },
    { name: regionName, url: absoluteUrl(`/regions/${region.slug}`) },
    {
      name: cityName,
      url: absoluteUrl(`/regions/${region.slug}/${city.slug}`),
    },
  ]);
  const faqJsonLd = buildFaqJsonLd(faqItems);
  const jsonLd = [breadcrumbJsonLd, faqJsonLd].filter(
    (item): item is NonNullable<typeof item> => item !== null,
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        title={cityName}
        description={description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: t("regions.title"), href: "/regions" },
          { label: regionName, href: `/regions/${region.slug}` },
          { label: cityName },
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
        <FaqAccordion
          title={t("faqs.title")}
          items={faqItems}
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
