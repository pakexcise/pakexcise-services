import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ContactSupportOptionsSection } from "@/components/marketing/contact-support-options";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { HomeAboutSection } from "@/components/marketing/home-about-section";
import { HomeBlogSection } from "@/components/marketing/home-blog-section";
import { HomeDocumentsPreviewSection } from "@/components/marketing/home-documents-preview-section";
import { HomeFinalCtaSection } from "@/components/marketing/home-final-cta-section";
import { HomeGuidesSection } from "@/components/marketing/home-guides-section";
import { HomeHeroSection } from "@/components/marketing/home-hero-section";
import { HomeHowItWorksSection } from "@/components/marketing/home-how-it-works-section";
import { HomePopularServicesSection } from "@/components/marketing/home-popular-services-section";
import { HomeRegionsSection } from "@/components/marketing/home-regions-section";
import { HomeSectionShell } from "@/components/marketing/home-section-shell";
import { HomeServicesSection } from "@/components/marketing/home-services-section";
import { HomeVehicleVisualSection } from "@/components/marketing/home-vehicle-visual-section";
import { HomeWhyChooseSection } from "@/components/marketing/home-why-choose-section";
import { JsonLd } from "@/components/marketing/json-ld";
import { SectionHeader } from "@/components/marketing/section-header";
import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { Button } from "@/components/ui/button";
import { getContactPageSettings } from "@/features/contact-page/lib/contact-page-settings-cache";
import { buildServiceCardLabels } from "@/features/marketing/lib/build-service-card-labels";
import { mapFaqsForLocale } from "@/features/marketing/lib/map-faqs";
import {
  getHomePageSettings,
  getOrderedActiveHomeSections,
  localizeHomePageSettings,
} from "@/features/home-page/lib/home-page-settings-cache";
import type { HomeSectionKey } from "@/features/home-page/types";
import {
  buildFaqJsonLd,
  buildLocalBusinessJsonLd,
  buildOrganizationJsonLd,
  buildServiceJsonLd,
  buildWebSiteJsonLd,
} from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import {
  getServiceAssignedRegions,
  getServiceRegionLabel,
} from "@/features/services/lib/service-regions";
import {
  getFeatureFlagSettings,
  getSeoSettings,
} from "@/features/settings/lib/public-settings-cache";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/i18n/content";
import { absoluteUrl } from "@/lib/utils";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-service-message";
import {
  blogPostRepository,
  documentRequirementRepository,
  faqRepository,
  getFeaturedServices,
  guideRepository,
  regionRepository,
  seoMetaRepository,
} from "@/server/repositories";
import { serviceCategoryRepository } from "@/server/repositories/service-category-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export const revalidate = 3600;

type HomeSectionTone = "default" | "muted" | "accent";

const SECTION_TONES: HomeSectionTone[] = ["default", "muted", "accent"];

function getSectionTone(index: number): HomeSectionTone {
  return SECTION_TONES[index % SECTION_TONES.length] ?? "default";
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const [settings, seo] = await Promise.all([
    getHomePageSettings(),
    seoMetaRepository.findByPageKey("home"),
  ]);

  return resolveMetadataFromSeo({
    locale,
    path: "/",
    seo,
    fallbacks: {
      title: {
        en: settings.seo.metaTitleEn,
        ur: settings.seo.metaTitleUr,
      },
      description: {
        en: settings.seo.metaDescriptionEn,
        ur: settings.seo.metaDescriptionUr,
      },
      h1: {
        en: settings.seo.h1En,
        ur: settings.seo.h1Ur,
      },
    },
  });
}

export default async function HomePage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const [
    settings,
    content,
    contactSettings,
    seoSettings,
    featureFlags,
    categoryGroups,
    popularServices,
    regions,
    faqs,
    documents,
    blogPosts,
    guides,
    tCommon,
    tMarketing,
  ] = await Promise.all([
    getHomePageSettings(),
    getHomePageSettings().then((value) =>
      localizeHomePageSettings(value, locale),
    ),
    getContactPageSettings(),
    getSeoSettings(),
    getFeatureFlagSettings(),
    serviceCategoryRepository.listPublicGrouped(),
    getHomePageSettings().then(async (homeSettings) =>
      getFeaturedServices(homeSettings.limits.popularCount),
    ),
    regionRepository.listPublicWithServiceCounts(),
    getHomePageSettings().then(async (homeSettings) => {
      const items = await faqRepository.listGlobalPublic();
      return items.slice(0, homeSettings.limits.faqCount);
    }),
    getHomePageSettings().then(async (homeSettings) =>
      documentRequirementRepository.listPublicPreview(homeSettings.limits.documentCount),
    ),
    getHomePageSettings().then(async (homeSettings) =>
      blogPostRepository.listPublished(homeSettings.limits.blogCount),
    ),
    getHomePageSettings().then(async (homeSettings) =>
      guideRepository.listPublished(homeSettings.limits.guideCount),
    ),
    getTranslations("common"),
    getTranslations("marketing"),
  ]);

  if (!settings.isPageActive) {
    notFound();
  }

  const serviceCardLabels = buildServiceCardLabels(tCommon, tMarketing);
  const whatsappHref = buildWhatsAppUrl(
    contactSettings.whatsappNumber,
    contactSettings.whatsappPrefillMessage,
  );
  const faqItems = mapFaqsForLocale(faqs, locale);
  const baseUrl = absoluteUrl("/");
  const orderedSections = getOrderedActiveHomeSections(settings);

  const jsonLd = [
    buildOrganizationJsonLd(baseUrl, seoSettings),
    buildWebSiteJsonLd(baseUrl),
    buildLocalBusinessJsonLd(baseUrl, seoSettings),
    ...(faqItems.length > 0 ? [buildFaqJsonLd(faqItems)] : []),
    ...popularServices.map((service) => {
      const name = pickLocalized(locale, {
        en: service.nameEn,
        ur: service.nameUr,
      });
      const description = pickLocalized(locale, {
        en: service.shortDescriptionEn ?? service.nameEn,
        ur: service.shortDescriptionUr ?? service.nameUr,
      });
      const assignedRegions = getServiceAssignedRegions(service);
      const regionName = getServiceRegionLabel(
        service,
        locale,
        tMarketing("services.multipleRegions"),
        tMarketing("services.allProvinces"),
      );
      const areaServed =
        assignedRegions.length > 0
          ? assignedRegions
              .map((region) =>
                pickLocalized(locale, { en: region.nameEn, ur: region.nameUr }),
              )
              .join(", ")
          : regionName;

      return buildServiceJsonLd({
        name,
        description,
        url: absoluteUrl(`/services/${service.slug}`),
        areaServed,
      });
    }),
  ];

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
    trackingBadge: tMarketing("serviceOptions.trackingBadge"),
  };

  function renderSection(key: HomeSectionKey, tone: HomeSectionTone) {
    switch (key) {
      case "options":
        return (
          <HomeSectionShell key={key} tone={tone}>
            <ContactSupportOptionsSection
              whatsappPhone={contactSettings.whatsappNumber}
              whatsappMessage={contactSettings.whatsappPrefillMessage}
              requestHref="/contact#contact-form"
              note={content.optionsNote}
              labels={supportOptionLabels}
            />
          </HomeSectionShell>
        );

      case "popular":
        return (
          <HomePopularServicesSection
            key={key}
            title={content.sections.popular.title}
            description={content.sections.popular.description}
            services={popularServices}
            locale={locale}
            labels={serviceCardLabels}
            badgeLabel={tMarketing("services.popularBadge")}
            viewAllLabel={tCommon("viewAll")}
            emptyMessage={tMarketing("services.empty")}
            tone={tone}
          />
        );

      case "services":
        return (
          <HomeServicesSection
            key={key}
            title={content.sections.services.title}
            description={content.sections.services.description}
            categoryGroups={categoryGroups}
            locale={locale}
            labels={serviceCardLabels}
            viewAllLabel={tCommon("viewAll")}
            emptyMessage={tMarketing("services.empty")}
            emptyActionLabel={tMarketing("service.ctaTitle")}
            tone={tone}
          />
        );

      case "regions":
        return (
          <HomeRegionsSection
            key={key}
            title={content.sections.regions.title}
            description={content.sections.regions.description}
            regions={regions}
            locale={locale}
            viewLabel={tMarketing("regions.viewServices")}
            viewAllLabel={tCommon("viewAll")}
            emptyMessage={tMarketing("regions.empty")}
            tone={tone}
          />
        );

      case "howItWorks":
        return (
          <HomeHowItWorksSection
            key={key}
            title={content.sections.howItWorks.title}
            description={content.sections.howItWorks.description}
            steps={content.howItWorksSteps}
            tone={tone}
          />
        );

      case "vehicleVisual":
        return (
          <HomeVehicleVisualSection
            key={key}
            title={content.sections.vehicleVisual.title}
            description={content.sections.vehicleVisual.description}
            imagePath={content.vehicleVisual.imagePath}
            imageAlt={content.vehicleVisual.imageAlt}
            featurePoints={content.vehicleVisual.featurePoints}
            browseCta={content.vehicleVisual.browseCta}
            whatsappCta={content.vehicleVisual.whatsappCta}
            requestCta={content.vehicleVisual.requestCta}
            whatsappHref={whatsappHref}
            tone={tone}
          />
        );

      case "documents":
        return (
          <HomeDocumentsPreviewSection
            key={key}
            title={content.sections.documents.title}
            description={content.sections.documents.description}
            documents={documents}
            locale={locale}
            requiredLabel={tMarketing("service.required")}
            optionalLabel={tMarketing("service.optional")}
            viewAllLabel={tCommon("learnMore")}
            emptyMessage={tMarketing("service.documentsEmpty")}
            tone={tone}
          />
        );

      case "whyChoose":
        return (
          <HomeWhyChooseSection
            key={key}
            title={content.sections.whyChoose.title}
            description={content.sections.whyChoose.description}
            items={content.whyChooseItems}
            tone={tone}
          />
        );

      case "about":
        return (
          <HomeAboutSection
            key={key}
            title={content.about.title}
            description={content.about.description}
            additional={content.about.additional}
            cta={content.about.cta}
            trustCards={content.about.trustCards}
            tone={tone}
          />
        );

      case "guides":
        if (!featureFlags.guidesEnabled) {
          return null;
        }
        return (
          <HomeGuidesSection
            key={key}
            title={content.sections.guides.title}
            description={content.sections.guides.description}
            guides={guides}
            locale={locale}
            readGuideLabel={tCommon("learnMore")}
            viewAllLabel={tCommon("viewAll")}
            emptyMessage={tMarketing("guides.empty")}
            tone={tone}
          />
        );

      case "blog":
        if (!featureFlags.blogEnabled) {
          return null;
        }
        return (
          <HomeBlogSection
            key={key}
            title={content.sections.blog.title}
            description={content.sections.blog.description}
            posts={blogPosts}
            locale={locale}
            readMoreLabel={tCommon("learnMore")}
            viewAllLabel={tCommon("viewAll")}
            emptyMessage={tMarketing("blog.empty")}
            tone={tone}
          />
        );

      case "faqs":
        return (
          <HomeSectionShell key={key} tone={tone}>
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

      case "finalCta":
        return (
          <HomeSectionShell
            key={key}
            tone={tone}
            containerClassName="pb-8 md:pb-12"
          >
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

      default:
        return null;
    }
  }

  return (
    <>
      <JsonLd data={jsonLd} />

      <HomeHeroSection
        badge={content.hero.badge}
        title={content.hero.title}
        subtitle={content.hero.description}
        browseCta={content.hero.browseCta}
        whatsappCta={content.hero.whatsappCta}
        requestCta={content.hero.requestCta}
        whatsappHref={whatsappHref}
        trustBadges={content.hero.trustBadges}
        processCards={content.hero.processCards}
        processTitle={tMarketing("services.processTitle")}
      />

      {orderedSections.map((section, index) =>
        renderSection(section.key, getSectionTone(index)),
      )}
    </>
  );
}
