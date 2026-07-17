import type { Metadata } from "next";
import { Eye, LockKeyhole, MessageCircle, ShieldCheck, Users } from "lucide-react";

import { CTASection } from "@/components/marketing/cta-section";
import { CustomerReviewForm } from "@/components/marketing/customer-review-form";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { ProseContent } from "@/components/marketing/prose-content";
import { ReviewCard } from "@/components/marketing/review-card";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/shared/rating-stars";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { buildBreadcrumbJsonLd, buildReviewsJsonLd } from "@/features/seo/lib/metadata";
import {
  resolveMetadataFromSeo,
  resolveVisibleH1,
} from "@/features/seo/lib/resolve-metadata";
import { requireReviewsEnabled } from "@/features/settings/lib/feature-gates";
import { getBusinessSettings } from "@/features/settings/lib/public-settings-cache";
import { resolveWhatsappLinkNumber } from "@/features/settings/lib/resolve-public-contact";
import { getTranslations } from "@/lib/i18n/t";
import { absoluteUrl } from "@/lib/utils";
import { getCurrentUser } from "@/server/auth/current-user";
import {
  getPageContent,
  reviewRepository,
  seoMetaRepository,
  serviceRepository,
} from "@/server/repositories";

type ReviewsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

function removeDuplicatePrivateDisclaimer(content: string): string {
  return content
    .split(/\n{2,}/)
    .filter(
      (paragraph) =>
        !(
          paragraph.includes("PakExcise.com is a private facilitation service") &&
          paragraph.includes("Government of Pakistan body")
        ),
    )
    .join("\n\n")
    .trim();
}

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
        en:
          content?.excerptEn ??
          removeDuplicatePrivateDisclaimer(content?.contentEn ?? "").slice(0, 160),
      },
      h1: {
        en: seo?.h1En ?? content?.titleEn ?? "Customer Reviews",
      },
    },
  });
}

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  await requireReviewsEnabled();
  const params = await searchParams;
  const requestedPage = Math.max(1, Number(params.page ?? "1") || 1);

  const [content, seo, reviewsResult, summary, business, tMarketing, tCommon, currentUser, services] =
    await Promise.all([
      getPageContent("reviews"),
      seoMetaRepository.findByPageKey("reviews"),
      reviewRepository.listPublicPaginated(requestedPage, 6),
      reviewRepository.getPublicSummary(),
      getBusinessSettings(),
      getTranslations("marketing"),
      getTranslations("common"),
      getCurrentUser(),
      serviceRepository.listPublicReviewOptions(),
    ]);
  const reviews = reviewsResult.items;

  const eligibleApplications =
    currentUser?.role === "CUSTOMER"
      ? await reviewRepository.listEligibleApplicationsForCustomer(currentUser.id)
      : [];

  const title = resolveVisibleH1(seo, content?.titleEn ?? "Customer Reviews");
  const intro = removeDuplicatePrivateDisclaimer(content?.contentEn ?? "");
  const whatsappPhone = resolveWhatsappLinkNumber(business);
  const googleReviewHref = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL?.trim() || "";

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
                {summary.averageRating.toFixed(1)}
              </p>
              <RatingStars
                rating={summary.averageRating}
                className="mt-3 justify-center [&_svg]:size-5"
              />
              <p className="mt-2 text-sm font-medium">
                {tMarketing("reviews.ratingSummary", { count: summary.count })}
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <TrustPoint
                icon={ShieldCheck}
                title={tMarketing("reviews.privateTitle")}
                description={tMarketing("reviews.privateDescription")}
              />
              <TrustPoint
                icon={Eye}
                title={tMarketing("reviews.transparentTitle")}
                description={tMarketing("reviews.transparentDescription")}
              />
              <TrustPoint
                icon={LockKeyhole}
                title={tMarketing("reviews.privacyTitle")}
                description={tMarketing("reviews.privacyDescription")}
              />
            </div>
          </div>
        </section>

        {googleReviewHref ? (
          <section className="rounded-2xl border bg-card p-5 md:p-6">
            <h2 className="text-lg font-semibold">{tMarketing("reviews.googleReviewCta")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {tMarketing("reviews.googleReviewDescription")}
            </p>
            <Button asChild className="mt-4" variant="secondary">
              <a href={googleReviewHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" aria-hidden="true" />
                {tMarketing("reviews.googleReviewCta")}
              </a>
            </Button>
          </section>
        ) : null}

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
                  feedbackLabel={
                    review.source === "GOOGLE"
                      ? tMarketing("reviews.googleLabel")
                      : tMarketing("reviews.customerLabel")
                  }
                />
              ))}
            </div>
            <PaginationControls
              page={reviewsResult.page}
              totalPages={reviewsResult.totalPages}
              basePath="/reviews"
            />
          </section>
        ) : (
          <p className="text-sm text-muted-foreground">{tMarketing("reviews.empty")}</p>
        )}

        <CustomerReviewForm
          applications={eligibleApplications}
          services={services.map((service) => ({
            id: service.id,
            nameEn: service.nameEn,
          }))}
          turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || ""}
          labels={{
            title: tMarketing("reviews.formTitle"),
            description: tMarketing("reviews.formDescription"),
            application: tMarketing("reviews.formApplication"),
            applicationOptional: tMarketing("reviews.formApplicationOptional"),
            service: tMarketing("reviews.formService"),
            name: tMarketing("reviews.formName"),
            content: tMarketing("reviews.formContent"),
            rating: tMarketing("reviews.formRating"),
            ratingValue: tMarketing("reviews.formRatingValue"),
            ratingOption: tMarketing("reviews.formRatingOption"),
            consent: tMarketing("reviews.formConsent"),
            antiSpamUnavailable: tMarketing("reviews.formAntiSpamUnavailable"),
            submit: tMarketing("reviews.formSubmit"),
            submitting: tMarketing("reviews.formSubmitting"),
            success: tMarketing("reviews.formSuccess"),
          }}
        />

        <CTASection
          title={tMarketing("service.ctaTitle")}
          description={tMarketing("service.ctaDescription")}
          applyLabel={tMarketing("service.applyNow")}
          applyHref="/services"
          whatsappLabel={tCommon("whatsappHelp")}
          whatsappPhone={whatsappPhone}
          whatsappMessage={business.whatsappDefaultMessageEn || business.whatsappDefaultMessage}
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
