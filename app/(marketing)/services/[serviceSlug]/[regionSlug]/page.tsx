import { redirect } from "next/navigation";
import type { Metadata, Route } from "next";
import { getTranslations } from "@/lib/i18n/t";
import { notFound } from "next/navigation";

import { ViewServiceTracker } from "@/components/analytics/ViewServiceTracker";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { HowItWorksSteps } from "@/components/marketing/how-it-works-steps";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { ProseContent } from "@/components/marketing/prose-content";
import { RegionGroupedDocumentChecklist } from "@/components/marketing/region-grouped-document-checklist";
import { RelatedServices } from "@/components/marketing/related-services";
import { PublicReviewsSection } from "@/components/marketing/public-reviews-section";
import { ServiceFieldsPreview } from "@/components/marketing/service-fields-preview";
import { ServiceInfoSidebar } from "@/components/marketing/service-info-sidebar";
import { ServiceOptionsSection } from "@/components/marketing/service-options-section";
import { ServiceRegionsList } from "@/components/marketing/service-regions-list";
import { mapFaqsForLocale } from "@/features/marketing/lib/map-faqs";
import { buildServiceCardLabels } from "@/features/marketing/lib/build-service-card-labels";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildServiceJsonLd,
} from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo, resolveVisibleH1 } from "@/features/seo/lib/resolve-metadata";
import {
  getServiceAssignedRegions,
} from "@/features/services/lib/service-regions";
import {
  buildDefaultServiceRegionSeo,
  buildServiceRegionPageKey,
  buildServiceRegionPath,
} from "@/features/services/lib/service-region-pages";
import {
  filterDocumentsByRegion,
  filterFieldsByRegion,
  getRegionSupportNoteForSlug,
  groupDocumentsByRegion,
  mapServiceDocumentsForLocale,
  mapServiceFieldsForLocale,
} from "@/features/services/lib/map-service-requirements";
import { absoluteUrl } from "@/lib/utils";
import {
  faqRepository,
  redirectRepository,
  reviewRepository,
  serviceRepository,
} from "@/server/repositories";
import {
  getBusinessSettings,
  getFeatureFlagSettings,
} from "@/features/settings/lib/public-settings-cache";
import {
  resolveWhatsappDefaultMessage,
  resolveWhatsappLinkNumber,
} from "@/features/settings/lib/resolve-public-contact";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-service-message";
import { resolveCanonicalRegionSlug } from "@/config/region-slugs";

export const revalidate = 3600;

type ServiceRegionPageProps = {
  params: Promise<{ serviceSlug: string; regionSlug: string }>;
};

export async function generateMetadata({
  params,
}: ServiceRegionPageProps): Promise<Metadata> {
  const { serviceSlug, regionSlug } = await params;
  const canonicalRegionSlug = resolveCanonicalRegionSlug(regionSlug);
  const locale = "en";

  const service = await serviceRepository.findPublicDetailBySlugAndRegion(
    serviceSlug,
    canonicalRegionSlug,
  );

  if (!service) {
    return {};
  }

  const region = getServiceAssignedRegions(service).find(
    (entry) => entry.slug === canonicalRegionSlug,
  );
  const pageKey = buildServiceRegionPageKey(serviceSlug, canonicalRegionSlug);
  const seo = await serviceRepository.findPublicRegionSeoByPageKey(pageKey);
  const defaults = buildDefaultServiceRegionSeo({
    serviceName: service.nameEn,
    serviceShortDescription: service.shortDescriptionEn,
    regionName: region?.nameEn ?? canonicalRegionSlug,
  });

  return await resolveMetadataFromSeo({
    locale,
    path: buildServiceRegionPath(serviceSlug, canonicalRegionSlug),
    seo,
    fallbacks: {
      title: { en: defaults.metaTitleEn },
      description: { en: defaults.metaDescriptionEn },
      h1: { en: defaults.h1En },
    },
  });
}

export default async function ServiceRegionDetailPage({
  params,
}: ServiceRegionPageProps) {
  const { serviceSlug, regionSlug } = await params;
  const canonicalRegionSlug = resolveCanonicalRegionSlug(regionSlug);

  if (canonicalRegionSlug !== regionSlug) {
    redirect(
      buildServiceRegionPath(serviceSlug, canonicalRegionSlug) as Route,
    );
  }

  const locale = "en";
  const service = await serviceRepository.findPublicDetailBySlugAndRegion(
    serviceSlug,
    canonicalRegionSlug,
  );

  if (!service) {
    const slugRedirect = await redirectRepository.findActiveByOldSlug(serviceSlug);

    if (slugRedirect) {
      redirect(
        buildServiceRegionPath(slugRedirect.newSlug, canonicalRegionSlug) as Route,
      );
    }

    notFound();
  }

  const region = getServiceAssignedRegions(service).find(
    (entry) => entry.slug === canonicalRegionSlug,
  );

  if (!region) {
    notFound();
  }

  const t = await getTranslations("marketing");
  const tCommon = await getTranslations("common");
  const tHome = await getTranslations("home");
  const tNav = await getTranslations("nav");

  const pageKey = buildServiceRegionPageKey(serviceSlug, canonicalRegionSlug);
  const [serviceFaqs, relatedServices, businessSettings, featureFlags, serviceReviews, serviceReviewSummary, regionSeo] =
    await Promise.all([
      faqRepository.listByServiceId(service.id),
      serviceRepository.listRelatedServices(service.id, 3),
      getBusinessSettings(),
      getFeatureFlagSettings(),
      reviewRepository.listPublicForService(service.id, 3),
      reviewRepository.getPublicSummary(service.id),
      serviceRepository.findPublicRegionSeoByPageKey(pageKey),
    ]);

  const [reviews, reviewSummary] =
    serviceReviews.length > 0
      ? [serviceReviews, serviceReviewSummary]
      : await Promise.all([
          reviewRepository.listPublicFeatured(6),
          reviewRepository.getPublicSummary(),
        ]);

  const whatsappLinkNumber = resolveWhatsappLinkNumber(businessSettings);
  const whatsappMessage = resolveWhatsappDefaultMessage(businessSettings, locale);

  const name = service.nameEn ?? "";
  const regionName = region.nameEn ?? "";
  const seoDefaults = buildDefaultServiceRegionSeo({
    serviceName: name,
    serviceShortDescription: service.shortDescriptionEn,
    regionName,
  });
  const heroTitle = resolveVisibleH1(regionSeo, seoDefaults.h1En);
  const description =
    regionSeo?.metaDescriptionEn?.trim() ||
    service.shortDescriptionEn ||
    seoDefaults.metaDescriptionEn;
  const content = service.contentEn ?? service.shortDescriptionEn;
  const processingNotes = service.processingNotesEn ?? "";
  const categoryName = service.category ? service.category.nameEn ?? "" : null;
  const assignedRegions = getServiceAssignedRegions(service);
  const regionSupportNote = getRegionSupportNoteForSlug(
    service.serviceRegions,
    canonicalRegionSlug,
    locale,
  );

  const faqItems = mapFaqsForLocale(serviceFaqs, locale);
  const allRegionsLabel = t("service.allRegionsScope");
  const mappedDocuments = filterDocumentsByRegion(
    mapServiceDocumentsForLocale(service.documentReqs, locale, allRegionsLabel),
    canonicalRegionSlug,
  );
  const documentGroups = groupDocumentsByRegion(mappedDocuments, allRegionsLabel);
  const mappedFields = filterFieldsByRegion(
    mapServiceFieldsForLocale(service.formFields, locale, allRegionsLabel),
    service.activeRegionId,
  );
  const requiredDocumentCount = mappedDocuments.filter(
    (doc) => doc.isRequired && doc.kind === "FILE",
  ).length;

  const pagePath = buildServiceRegionPath(serviceSlug, canonicalRegionSlug);
  const serviceUrl = absoluteUrl(pagePath);
  const breadcrumbItems = [
    { label: tNav("home"), href: "/" },
    { label: t("services.title"), href: "/services" },
    { label: name, href: `/services/${service.slug}` },
    { label: regionName },
  ];
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: t("services.title"), url: absoluteUrl("/services") },
    { name, url: absoluteUrl(`/services/${service.slug}`) },
    { name: regionName, url: serviceUrl },
  ]);
  const serviceJsonLd = buildServiceJsonLd({
    name: `${name} — ${regionName}`,
    description: description || name,
    url: serviceUrl,
    areaServed: regionName,
  });
  const faqJsonLd = buildFaqJsonLd(faqItems);
  const jsonLd = [breadcrumbJsonLd, serviceJsonLd, faqJsonLd].filter(
    (item): item is NonNullable<typeof item> => item !== null,
  );

  const serviceOptionsLabels = {
    sectionTitle: t("serviceOptions.title"),
    sectionDescription: t("serviceOptions.description"),
    whatsappTitle: t("serviceOptions.whatsappTitle"),
    whatsappDescription: t("serviceOptions.whatsappDescription"),
    whatsappCta: t("serviceOptions.whatsappCta"),
    guestTitle: t("serviceOptions.guestTitle"),
    guestDescription: t("serviceOptions.guestDescription"),
    guestCta: t("serviceOptions.guestCta"),
    accountTitle: t("serviceOptions.accountTitle"),
    accountDescription: t("serviceOptions.accountDescription"),
    accountCta: t("serviceOptions.accountCta"),
    accountSubServiceCta: t("serviceOptions.accountSubServiceCta"),
    fastestBadge: t("serviceOptions.fastestBadge"),
    trackingBadge: t("serviceOptions.trackingBadge"),
  };

  return (
    <>
      <ViewServiceTracker serviceSlug={service.slug} serviceId={service.id} />
      <JsonLd data={jsonLd} />
      <PageHero
        title={heroTitle}
        description={description}
        breadcrumbs={breadcrumbItems}
      />

      <div className="container-site py-10 md:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
          <div className="space-y-12">
            {categoryName ? (
              <p className="text-sm font-medium text-primary">
                {t("service.categoryLabel", { category: categoryName })}
              </p>
            ) : null}

            <ProseContent content={content ?? ""} />

            {regionSupportNote ? (
              <section className="space-y-3 rounded-xl border bg-muted/30 p-5">
                <h2 className="text-xl font-bold">
                  {t("service.regionSupportTitle")} — {regionName}
                </h2>
                <ProseContent content={regionSupportNote} />
              </section>
            ) : null}

            <ServiceOptionsSection
              serviceSlug={service.slug}
              serviceName={name}
              regionLabel={regionName}
              whatsappPhone={whatsappLinkNumber}
              whatsappDefaultMessage={whatsappMessage}
              locale={locale}
              labels={serviceOptionsLabels}
            />

            {assignedRegions.length > 1 ? (
              <ServiceRegionsList
                title={t("service.otherRegionsTitle")}
                regions={assignedRegions.filter(
                  (entry) => entry.slug !== canonicalRegionSlug,
                )}
                serviceSlug={service.slug}
              />
            ) : null}

            {processingNotes?.trim() ? (
              <section className="space-y-3 rounded-xl border bg-muted/30 p-5">
                <h2 className="text-xl font-bold">{t("service.importantNotes")}</h2>
                <ProseContent content={processingNotes} />
              </section>
            ) : null}

            <ServiceFieldsPreview
              title={t("service.fieldsTitle")}
              description={t("service.fieldsDescription")}
              fields={mappedFields}
              requiredLabel={t("service.required")}
              optionalLabel={t("service.optional")}
              emptyMessage={t("service.fieldsEmpty")}
            />

            <RegionGroupedDocumentChecklist
              title={t("service.documentsTitle")}
              groups={documentGroups}
              requiredLabel={t("service.required")}
              optionalLabel={t("service.optional")}
              emptyMessage={t("service.documentsEmpty")}
            />

            <HowItWorksSteps
              title={tHome("howItWorksTitle")}
              steps={[
                {
                  title: tHome("howItWorksStep1Title"),
                  description: tHome("howItWorksStep1Description"),
                },
                {
                  title: tHome("howItWorksStep2Title"),
                  description: tHome("howItWorksStep2Description"),
                },
                {
                  title: tHome("howItWorksStep3Title"),
                  description: tHome("howItWorksStep3Description"),
                },
              ]}
            />

            <FaqAccordion
              title={t("service.faqsTitle")}
              items={faqItems}
              emptyMessage={t("service.faqsEmpty")}
            />

            {featureFlags.reviewsEnabled ? (
              <PublicReviewsSection
                reviews={reviews}
                title={t("reviews.homeTitle")}
                description={t("reviews.homeDescription")}
                feedbackLabel={t("reviews.feedbackLabel")}
                customerLabel={t("reviews.customerLabel")}
                googleLabel={t("reviews.googleLabel")}
                countLabel={t("reviews.ratingSummary", {
                  count: reviewSummary.count,
                })}
                averageRating={reviewSummary.averageRating}
                viewAllLabel={t("reviews.viewAll")}
                googleReviewHref={
                  process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL?.trim() || undefined
                }
                googleReviewLabel={t("reviews.googleReviewCta")}
                tone="default"
              />
            ) : null}

            <RelatedServices
              title={t("service.relatedTitle")}
              services={relatedServices}
              locale={locale}
              labels={buildServiceCardLabels(tCommon, t)}
              regionSlug={canonicalRegionSlug}
            />
          </div>

          <ServiceInfoSidebar
            serviceName={`${name} — ${regionName}`}
            regionLabel={regionName}
            documentCount={mappedDocuments.filter((doc) => doc.kind === "FILE").length}
            requiredDocumentCount={requiredDocumentCount}
            documentsLabel={t("service.documentsTitle")}
            regionLabelTitle={t("service.availableIn")}
          />
        </div>
      </div>
    </>
  );
}
