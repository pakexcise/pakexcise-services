import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";
import { Eye, LockKeyhole, ShieldCheck, Star, Users } from "lucide-react";

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
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
      : 0;

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
      <div className="container-site space-y-10 py-10 md:space-y-14 md:py-14">
        <section className="overflow-hidden rounded-3xl border bg-linear-to-br from-primary/[0.07] via-background to-secondary/[0.08] p-5 shadow-sm md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_2fr] lg:items-center">
            <div className="text-center lg:border-r lg:pr-8">
              <p className="text-5xl font-bold tracking-tight text-primary">
                {averageRating.toFixed(1)}
              </p>
              <div className="mt-3 flex justify-center gap-1 text-secondary">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-5 fill-current" aria-hidden="true" />
                ))}
              </div>
              <p className="mt-2 text-sm font-medium">
                {tMarketing("reviews.ratingSummary", { count: reviews.length })}
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <TrustPoint icon={ShieldCheck} title={tMarketing("reviews.privateTitle")} description={tMarketing("reviews.privateDescription")} />
              <TrustPoint icon={Eye} title={tMarketing("reviews.transparentTitle")} description={tMarketing("reviews.transparentDescription")} />
              <TrustPoint icon={LockKeyhole} title={tMarketing("reviews.privacyTitle")} description={tMarketing("reviews.privacyDescription")} />
            </div>
          </div>
        </section>

        {intro ? (
          <div className="mx-auto max-w-3xl text-center">
            <ProseContent content={intro} />
          </div>
        ) : null}
        {reviews.length > 0 ? (
          <section aria-labelledby="customer-feedback-title">
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  {tMarketing("reviews.eyebrow")}
                </p>
                <h2 id="customer-feedback-title" className="mt-2 text-2xl font-bold md:text-3xl">
                  {tMarketing("reviews.sectionTitle")}
                </h2>
              </div>
              <Users className="hidden size-9 text-primary/35 sm:block" aria-hidden="true" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                feedbackLabel={tMarketing("reviews.feedbackLabel")}
              />
            ))}
            </div>
          </section>
        ) : (
          <p className="text-sm text-muted-foreground">
            {tMarketing("reviews.empty")}
          </p>
        )}
        <p className="rounded-2xl border border-secondary/40 bg-secondary/10 p-4 text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">{tMarketing("reviews.disclaimerTitle")}</strong>{" "}
          {tMarketing("reviews.disclaimer")}
        </p>
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

function TrustPoint({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <span className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h2 className="mt-3 text-sm font-semibold">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
  );
}
