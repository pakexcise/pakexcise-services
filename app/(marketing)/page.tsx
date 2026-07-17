import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ContactSupportOptionsSection } from "@/components/marketing/contact-support-options";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { HomeAboutSection } from "@/components/marketing/home-about-section";
import { HomeBlogSection } from "@/components/marketing/home-blog-section";
import { HomeDocumentsPreviewSection } from "@/components/marketing/home-documents-preview-section";
import { HomeFinalCtaSection } from "@/components/marketing/home-final-cta-section";
import { HomeHeroSection } from "@/components/marketing/home-hero-section";
import { HomeHowItWorksSection } from "@/components/marketing/home-how-it-works-section";
import { HomePopularServicesSection } from "@/components/marketing/home-popular-services-section";
import { HomeRegionsSection } from "@/components/marketing/home-regions-section";
import { PublicReviewsSection } from "@/components/marketing/public-reviews-section";
import { HomeSectionShell } from "@/components/marketing/home-section-shell";
import { HomeServicesSection } from "@/components/marketing/home-services-section";
import { HomeVehicleVisualSection } from "@/components/marketing/home-vehicle-visual-section";
import { HomeWhyChooseSection } from "@/components/marketing/home-why-choose-section";
import { JsonLd } from "@/components/marketing/json-ld";
import { SectionErrorBoundary } from "@/components/marketing/section-error-boundary";
import { SectionHeader } from "@/components/marketing/section-header";
import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-service-message";
import { buildServiceCardLabels } from "@/features/marketing/lib/build-service-card-labels";
import { mapFaqsForLocale } from "@/features/marketing/lib/map-faqs";
import {
  getHomePageSettings,
  getOrderedActiveHomeSections,
  localizeHomePageSettings} from "@/features/home-page/lib/home-page-settings-cache";
import { defaultHomePageSettings } from "@/features/home-page/lib/defaults";
import type { HomeSectionKey } from "@/features/home-page/types";
import {
  buildFaqJsonLd,
  buildItemListJsonLd} from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo, resolveVisibleH1 } from "@/features/seo/lib/resolve-metadata";
import {
  getBusinessSettings,
  getFeatureFlagSettings} from "@/features/settings/lib/public-settings-cache";
import {
  defaultBusinessSettings,
  defaultFeatureFlagSettings} from "@/features/settings/lib/defaults";
import {
  resolveWhatsappDefaultMessage,
  resolveWhatsappLinkNumber} from "@/features/settings/lib/resolve-public-contact";
import { seoAbsoluteUrl } from "@/lib/seo-url";
import {
  blogPostRepository,
  documentRequirementRepository,
  faqRepository,
  getFeaturedServices,
  regionRepository,
  reviewRepository,
  seoMetaRepository} from "@/server/repositories";
import { serviceCategoryRepository } from "@/server/repositories/service-category-repository";

import Link from "next/link";
export const dynamic = "force-dynamic";

type HomeSectionTone = "default" | "muted" | "accent";

const SECTION_TONES: HomeSectionTone[] = ["default", "muted", "accent"];

function getSectionTone(index: number): HomeSectionTone {
  return SECTION_TONES[index % SECTION_TONES.length] ?? "default";
}

async function safeLoad<T>(label: string, operation: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`[homepage] ${label} failed`, error);
    return fallback;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = "en";
  const [settings, seo] = await Promise.all([
    safeLoad("metadata:settings", () => getHomePageSettings(), defaultHomePageSettings()),
    safeLoad("metadata:seo", () => seoMetaRepository.findByPageKey("home"), null)]);

  return await resolveMetadataFromSeo({
    locale,
    path: "/",
    seo,
    fallbacks: {
      title: {
        en: settings.seo.metaTitleEn},
      description: {
        en: settings.seo.metaDescriptionEn},
      h1: {
        en: settings.seo.h1En}}});
}

export default async function HomePage() {
  const locale = "en";
const defaults = defaultHomePageSettings();

  const settings = await safeLoad(
    "settings",
    () => getHomePageSettings(),
    defaults,
  );

  if (!settings.isPageActive) {
    notFound();
  }

  const content = await safeLoad(
    "localize",
    async () => localizeHomePageSettings(settings, locale),
    localizeHomePageSettings(defaults, locale),
  );

  const [
    businessSettings,
    featureFlags,
    categoryGroups,
    popularServices,
    regions,
    faqs,
    documents,
    blogPosts,
    reviews,
    reviewSummary,
    homeSeo,
    tCommon,
    tMarketing] = await Promise.all([
    safeLoad("business", () => getBusinessSettings(), defaultBusinessSettings()),
    safeLoad(
      "features",
      () => getFeatureFlagSettings(),
      defaultFeatureFlagSettings(),
    ),
    safeLoad("categories", () => serviceCategoryRepository.listPublicGrouped(), []),
    safeLoad(
      "popularServices",
      () => getFeaturedServices(settings.limits.popularCount),
      [],
    ),
    safeLoad("regions", () => regionRepository.listPublicWithServiceCounts(), []),
    safeLoad(
      "faqs",
      () => faqRepository.listFeaturedGlobalPublic(settings.limits.faqCount),
      [],
    ),
    safeLoad(
      "documents",
      () =>
        documentRequirementRepository.listPublicPreview(settings.limits.documentCount),
      [],
    ),
    safeLoad(
      "blog",
      () => blogPostRepository.listPublished(settings.limits.blogCount),
      [],
    ),
    safeLoad("reviews", () => reviewRepository.listPublicFeatured(6), []),
    safeLoad("reviewSummary", () => reviewRepository.getPublicSummary(), {
      count: 0,
      averageRating: 0,
    }),
    safeLoad("homeSeo", () => seoMetaRepository.findByPageKey("home"), null),
    getTranslations("common"),
    getTranslations("marketing")]);

  const serviceCardLabels = buildServiceCardLabels(tCommon, tMarketing);
  const whatsappLinkNumber = resolveWhatsappLinkNumber(businessSettings);
  const whatsappMessage = resolveWhatsappDefaultMessage(businessSettings);
  const whatsappHref = buildWhatsAppUrl(whatsappLinkNumber, whatsappMessage);
  const heroTitle = resolveVisibleH1(homeSeo, content.hero.title);
  const faqItems = mapFaqsForLocale(faqs ?? [], locale);
  const orderedSections = getOrderedActiveHomeSections(settings);

  let jsonLd: Array<Record<string, unknown>> = [];
  try {
    const faqJsonLd = buildFaqJsonLd(faqItems);
    const featuredServicesJsonLd = buildItemListJsonLd({
      name: "Featured excise facilitation services",
      items: (popularServices ?? []).map((service) => ({
        name: service.nameEn ?? "",
        url: seoAbsoluteUrl(`/services/${service.slug}`)}))});
    jsonLd = [faqJsonLd, featuredServicesJsonLd].filter(
      (item): item is NonNullable<typeof item> => item !== null,
    );
  } catch (error) {
    console.error("[homepage] json-ld failed", error);
  }

  const supportOptionLabels = {
    sectionTitle: content.sections.options.title,
    sectionDescription: content.sections.options.description,
    whatsappTitle: tMarketing("serviceOptions.whatsappTitle"),
    whatsappDescription: tMarketing("serviceOptions.whatsappDescription"),
    whatsappCta: tMarketing("serviceOptions.whatsappCta"),
    requestTitle: tMarketing("serviceOptions.guestTitle"),
    requestDescription: tMarketing("serviceOptions.guestDescription"),
    requestCta: tMarketing("serviceOptions.guestCta"),
    accountTitle: tMarketing("serviceOptions.accountTitle"),
    accountDescription: tMarketing("serviceOptions.accountDescription"),
    accountCta: tMarketing("serviceOptions.accountCta"),
    fastestBadge: tMarketing("serviceOptions.fastestBadge"),
    trackingBadge: tMarketing("serviceOptions.trackingBadge")};

  function renderSection(key: HomeSectionKey, tone: HomeSectionTone): ReactNode {
    try {
      let sectionNode: ReactNode = null;

      switch (key) {
        case "options":
          sectionNode = (
            <HomeSectionShell tone={tone}>
              <ContactSupportOptionsSection
                whatsappPhone={whatsappLinkNumber}
                whatsappMessage={whatsappMessage}
                requestHref="/contact#contact-form"
                note={content.optionsNote}
                labels={supportOptionLabels}
              />
            </HomeSectionShell>
          );
          break;

        case "popular":
          sectionNode = (
            <HomePopularServicesSection
              title={content.sections.popular.title}
              description={content.sections.popular.description}
              services={popularServices ?? []}
              locale={locale}
              labels={serviceCardLabels}
              badgeLabel={tMarketing("services.popularBadge")}
              viewAllLabel={tCommon("viewAll")}
              emptyMessage={tMarketing("services.empty")}
              tone={tone}
            />
          );
          break;

        case "services":
          sectionNode = (
            <HomeServicesSection
              title={content.sections.services.title}
              description={content.sections.services.description}
              categoryGroups={categoryGroups ?? []}
              locale={locale}
              labels={serviceCardLabels}
              viewAllLabel={tCommon("viewAll")}
              emptyMessage={tMarketing("services.empty")}
              emptyActionLabel={tMarketing("service.ctaTitle")}
              tone={tone}
            />
          );
          break;

        case "regions":
          sectionNode = (
            <HomeRegionsSection
              title={content.sections.regions.title}
              description={content.sections.regions.description}
              regions={regions ?? []}
              locale={locale}
              viewLabel={tMarketing("regions.viewServices")}
              viewAllLabel={tCommon("viewAll")}
              emptyMessage={tMarketing("regions.empty")}
              tone={tone}
            />
          );
          break;

        case "howItWorks":
          sectionNode = (
            <HomeHowItWorksSection
              title={content.sections.howItWorks.title}
              description={content.sections.howItWorks.description}
              steps={content.howItWorksSteps}
              tone={tone}
            />
          );
          break;

        case "vehicleVisual":
          sectionNode = (
            <HomeVehicleVisualSection
              title={content.sections.vehicleVisual.title}
              description={content.sections.vehicleVisual.description}
              imagePath={content.vehicleVisual.imagePath}
              imageAlt={content.vehicleVisual.imageAlt}
              featurePoints={content.vehicleVisual.featurePoints}
              browseCta={content.vehicleVisual.browseCta}
              whatsappCta={content.vehicleVisual.whatsappCta}
              requestCta={content.vehicleVisual.requestCta}
              whatsappHref={whatsappHref}
            />
          );
          break;

        case "documents":
          sectionNode = (
            <HomeDocumentsPreviewSection
              title={content.sections.documents.title}
              description={content.sections.documents.description}
              documents={documents ?? []}
              locale={locale}
              requiredLabel={tMarketing("service.required")}
              optionalLabel={tMarketing("service.optional")}
              viewAllLabel={tCommon("learnMore")}
              emptyMessage={tMarketing("service.documentsEmpty")}
              tone={tone}
            />
          );
          break;

        case "whyChoose":
          sectionNode = (
            <HomeWhyChooseSection
              title={content.sections.whyChoose.title}
              description={content.sections.whyChoose.description}
              items={content.whyChooseItems}
              tone={tone}
            />
          );
          break;

        case "about":
          sectionNode = (
            <HomeAboutSection
              title={content.about.title}
              description={content.about.description}
              additional={content.about.additional}
              cta={content.about.cta}
              trustCards={content.about.trustCards}
              tone={tone}
            />
          );
          break;

        case "blog":
          if (!featureFlags.blogEnabled) {
            return null;
          }
          sectionNode = (
            <HomeBlogSection
              title={content.sections.blog.title}
              description={content.sections.blog.description}
              posts={blogPosts ?? []}
              locale={locale}
              readMoreLabel={tCommon("learnMore")}
              viewAllLabel={tCommon("viewAll")}
              emptyMessage={tMarketing("blog.empty")}
              tone={tone}
            />
          );
          break;

        case "faqs":
          sectionNode = (
            <HomeSectionShell tone={tone}>
              <SectionHeader
                title={content.sections.faqs.title}
                description={content.sections.faqs.description}
                action={
                  <Button asChild variant="ghost" className="hidden sm:inline-flex">
                    <Link href="/faqs">
                      {tCommon("viewAll")}
                      <DirectionalArrow />
                    </Link>
                  </Button>
                }
              />
              <div className="mt-8">
                <FaqAccordion items={faqItems} emptyMessage={tMarketing("faqs.empty")} />
              </div>
            </HomeSectionShell>
          );
          break;

        case "finalCta":
          sectionNode = (
            <HomeSectionShell tone={tone} containerClassName="pb-8 md:pb-12">
              <HomeFinalCtaSection
                title={content.sections.finalCta.title}
                description={content.sections.finalCta.description}
                browseLabel={content.hero.browseCta}
                whatsappLabel={content.hero.whatsappCta}
                requestLabel={content.hero.requestCta}
                accountLabel={tMarketing("serviceOptions.accountCta")}
                whatsappHref={whatsappHref}
              />
            </HomeSectionShell>
          );
          break;

        default:
          return null;
      }

      if (!sectionNode) {
        return null;
      }

      return (
        <SectionErrorBoundary key={key} name={key}>
          {sectionNode}
        </SectionErrorBoundary>
      );
    } catch (error) {
      console.error(`[homepage] section ${key} failed`, error);
      return null;
    }
  }

  return (
    <>
      {jsonLd.length > 0 ? <JsonLd data={jsonLd} /> : null}

      <HomeHeroSection
        badge={content.hero.badge}
        title={heroTitle}
        subtitle={content.hero.description}
        browseCta={content.hero.browseCta}
        whatsappCta={content.hero.whatsappCta}
        requestCta={content.hero.requestCta}
        whatsappHref={whatsappHref}
        trustBadges={content.hero.trustBadges ?? []}
        processCards={content.hero.processCards ?? []}
        processTitle={tMarketing("services.processTitle")}
      />

      {orderedSections.map((section, index) =>
        renderSection(section.key, getSectionTone(index)),
      )}

      {featureFlags.reviewsEnabled ? (
        <PublicReviewsSection
          reviews={reviews ?? []}
          title={tMarketing("reviews.homeTitle")}
          description={tMarketing("reviews.homeDescription")}
          feedbackLabel={tMarketing("reviews.feedbackLabel")}
          customerLabel={tMarketing("reviews.customerLabel")}
          googleLabel={tMarketing("reviews.googleLabel")}
          countLabel={tMarketing("reviews.ratingSummary", {
            count: reviewSummary.count,
          })}
          averageRating={reviewSummary.averageRating}
          viewAllLabel={tMarketing("reviews.viewAll")}
          googleReviewHref={process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL?.trim() || undefined}
          googleReviewLabel={tMarketing("reviews.googleReviewCta")}
          tone="muted"
        />
      ) : null}
    </>
  );
}
