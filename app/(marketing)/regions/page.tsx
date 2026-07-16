import type { Metadata } from "next";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { ProvinceCard } from "@/components/marketing/province-card";
import { PublicReviewsSection } from "@/components/marketing/public-reviews-section";
import { buildBreadcrumbJsonLd } from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import {
  getBusinessSettings,
  getFeatureFlagSettings,
} from "@/features/settings/lib/public-settings-cache";
import {
  resolveWhatsappDefaultMessage,
  resolveWhatsappLinkNumber,
} from "@/features/settings/lib/resolve-public-contact";
import { getTranslations } from "@/lib/i18n/t";
import { absoluteUrl } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-service-message";
import {
  regionRepository,
  reviewRepository,
  seoMetaRepository,
} from "@/server/repositories";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = "en";
    const seo = await seoMetaRepository.findByPageKey("regions");

  return await resolveMetadataFromSeo({
    locale,
    path: "/regions",
    seo,
    fallbacks: {
      title: {
        en: "Regions | PakExcise.com"},
      description: {
        en: "Explore excise facilitation services by region across Pakistan."},
      h1: {
        en: "Regions"}}});
}

export default async function RegionsPage() {
  const locale = "en";
  const [seo, regions, reviews, reviewSummary, business, featureFlags, t] =
    await Promise.all([
      seoMetaRepository.findByPageKey("regions"),
      regionRepository.listPublic(),
      reviewRepository.listPublicFeatured(6),
      reviewRepository.getPublicSummary(),
      getBusinessSettings(),
      getFeatureFlagSettings(),
      getTranslations("marketing"),
    ]);
  const whatsappHref = buildWhatsAppUrl(
    resolveWhatsappLinkNumber(business),
    resolveWhatsappDefaultMessage(business),
  );

  const title = seo?.h1En ?? "Regions";
  const description = seo?.metaDescriptionEn ?? "Explore excise facilitation services by region across Pakistan.";

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: title, url: absoluteUrl("/regions") }]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <PageHero
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: title }]}
      />
      <div className="container-site space-y-8 py-10 md:py-12">
        {regions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{"No active regions are available right now."}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {regions.map((region) => (
              <ProvinceCard
                key={region.id}
                region={region}
                locale={locale}
                viewLabel={"View services"}
              />
            ))}
          </div>
        )}
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
      </div>
    </>
  );
}
