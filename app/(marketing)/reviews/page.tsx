import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { CTASection } from "@/components/marketing/cta-section";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { ProseContent } from "@/components/marketing/prose-content";
import { ReviewCard } from "@/components/marketing/review-card";
import { buildBreadcrumbJsonLd, buildReviewsJsonLd } from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { requireReviewsEnabled } from "@/features/settings/lib/feature-gates";
import { getBusinessSettings } from "@/features/settings/lib/public-settings-cache";
import { resolveWhatsappLinkNumber } from "@/features/settings/lib/resolve-public-contact";
import { absoluteUrl } from "@/lib/utils";
import { getPageContent, reviewRepository, seoMetaRepository } from "@/server/repositories";
export async function generateMetadata(): Promise<Metadata> {
  const locale = "en";
  const [seo, content] = await Promise.all([
    seoMetaRepository.findByPageKey("reviews"),
    getPageContent("reviews"),
  ]);

  return await resolveMetadataFromSeo({
    locale,
    path: "/reviews",
    seo,
    fallbacks: {
      title: {
        en: content?.titleEn ?? "Customer Reviews",
      },
      description: {
        en: content?.excerptEn ?? content?.contentEn?.slice(0, 160) ?? "",
      },
      h1: {
        en: content?.titleEn ?? "Customer Reviews",
      },
    },
  });
}

export default async function ReviewsPage() {
  await requireReviewsEnabled();

  const locale = "en";
    const [content, reviews, business, tMarketing, tCommon] =
    await Promise.all([
      getPageContent("reviews"),
      reviewRepository.listPublic(),
      getBusinessSettings(),
      getTranslations("marketing"),
      getTranslations("common"),
    ]);

  const title = content?.titleEn ?? "Customer Reviews";
  const intro = content?.contentEn ?? "";

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: title, url: absoluteUrl("/reviews") },
  ]);
  const reviewJsonLd =
    reviews.length > 0
      ? buildReviewsJsonLd({
          pageUrl: absoluteUrl("/reviews"),
          itemReviewedName: business.siteName,
          itemReviewedUrl: absoluteUrl("/"),
          reviews: reviews.map((review) => ({
            authorName: review.authorNameEn ?? "",
            content: review.contentEn ?? "",
            rating: review.rating,
          })),
        })
      : [];

  return (
    <>
      <JsonLd data={[breadcrumbJsonLd, ...reviewJsonLd]} />
      <PageHero
        title={title}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: title },
        ]}
      />
      <div className="container-site space-y-10 py-10 md:py-12">
        {intro ? <ProseContent content={intro} /> : null}
        {reviews.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {tMarketing("reviews.empty")}
          </p>
        )}
        <CTASection
          title={tMarketing("service.ctaTitle")}
          description={tMarketing("service.ctaDescription")}
          applyLabel={tMarketing("service.applyNow")}
          applyHref="/services"
          whatsappLabel={tCommon("whatsappHelp")}
          whatsappPhone={resolveWhatsappLinkNumber(business)}
          whatsappMessage={business.whatsappDefaultMessage}
        />
      </div>
    </>
  );
}
