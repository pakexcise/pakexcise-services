import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ViewServiceTracker } from "@/components/analytics/ViewServiceTracker";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { HowItWorksSteps } from "@/components/marketing/how-it-works-steps";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { ProseContent } from "@/components/marketing/prose-content";
import { RegionGroupedDocumentChecklist } from "@/components/marketing/region-grouped-document-checklist";
import { RelatedServices } from "@/components/marketing/related-services";
import { ServiceFieldsPreview } from "@/components/marketing/service-fields-preview";
import { ServiceInfoSidebar } from "@/components/marketing/service-info-sidebar";
import { ServiceOptionsSection } from "@/components/marketing/service-options-section";
import { ServiceRegionNotes } from "@/components/marketing/service-region-notes";
import { ServiceRegionsList } from "@/components/marketing/service-regions-list";
import { ServiceSubServices } from "@/components/marketing/service-sub-services";
import { mapFaqsForLocale } from "@/features/marketing/lib/map-faqs";
import { buildServiceCardLabels } from "@/features/marketing/lib/build-service-card-labels";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildServiceJsonLd,
} from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { redirect } from "@/i18n/navigation";
import {
  getServiceAssignedRegions,
  getServiceRegionLabel,
} from "@/features/services/lib/service-regions";
import {
  getRegionSupportNotes,
  groupDocumentsByRegion,
  mapServiceDocumentsForLocale,
  mapServiceFieldsForLocale,
} from "@/features/services/lib/map-service-requirements";
import { pickLocalized } from "@/lib/i18n/content";
import { absoluteUrl } from "@/lib/utils";
import {
  faqRepository,
  redirectRepository,
  serviceRepository,
} from "@/server/repositories";
import { getBusinessSettings } from "@/features/settings/lib/public-settings-cache";
import {
  resolveWhatsappDefaultMessage,
  resolveWhatsappLinkNumber,
} from "@/features/settings/lib/resolve-public-contact";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export const revalidate = 3600;

type ServicePageProps = {
  params: Promise<{ serviceSlug: string }>;
};

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { serviceSlug } = await params;
  const locale = await getCurrentLocale();
  const service = await serviceRepository.findPublicDetailBySlug(serviceSlug);

  if (!service) {
    return {};
  }

  return await resolveMetadataFromSeo({
    locale,
    path: `/services/${service.slug}`,
    seo: service.seoMeta,
    fallbacks: {
      title: {
        en: `${service.nameEn} | PakExcise.com`,
        ur: `${service.nameUr} | PakExcise.com`,
      },
      description: {
        en: service.shortDescriptionEn ?? service.nameEn,
        ur: service.shortDescriptionUr ?? service.nameUr,
      },
      h1: {
        en: service.nameEn,
        ur: service.nameUr,
      },
    },
  });
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { serviceSlug } = await params;
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const slugRedirect = await redirectRepository.findActiveByOldSlug(serviceSlug);

  if (slugRedirect) {
    redirect({
      href: `/services/${slugRedirect.newSlug}`,
      locale,
    });
  }

  const service = await serviceRepository.findPublicDetailBySlug(serviceSlug);

  if (!service) {
    notFound();
  }

  const t = await getTranslations("marketing");
  const tCommon = await getTranslations("common");
  const tHome = await getTranslations("home");
  const tNav = await getTranslations("nav");

  const [serviceFaqs, relatedServices, businessSettings] = await Promise.all([
    faqRepository.listByServiceId(service.id),
    serviceRepository.listRelatedServices(service.id, 3),
    getBusinessSettings(),
  ]);

  const whatsappLinkNumber = resolveWhatsappLinkNumber(businessSettings);
  const whatsappMessage = resolveWhatsappDefaultMessage(businessSettings, locale);

  const name = pickLocalized(locale, {
    en: service.nameEn,
    ur: service.nameUr,
  });
  const description = pickLocalized(locale, {
    en: service.shortDescriptionEn,
    ur: service.shortDescriptionUr,
  });
  const content = pickLocalized(locale, {
    en: service.contentEn ?? service.shortDescriptionEn,
    ur: service.contentUr ?? service.shortDescriptionUr,
  });
  const processingNotes = pickLocalized(locale, {
    en: service.processingNotesEn,
    ur: service.processingNotesUr,
  });
  const categoryName = service.category
    ? pickLocalized(locale, {
        en: service.category.nameEn,
        ur: service.category.nameUr,
      })
    : null;
  const assignedRegions = getServiceAssignedRegions(service);
  const regionName = getServiceRegionLabel(
    service,
    locale,
    t("services.multipleRegions"),
    t("services.allProvinces"),
  );
  const areaServed =
    assignedRegions.length > 0
      ? assignedRegions
          .map((region) =>
            pickLocalized(locale, { en: region.nameEn, ur: region.nameUr }),
          )
          .join(", ")
      : regionName;

  const faqItems = mapFaqsForLocale(serviceFaqs, locale);
  const allRegionsLabel = t("service.allRegionsScope");
  const mappedDocuments = mapServiceDocumentsForLocale(
    service.documentReqs,
    locale,
    allRegionsLabel,
  );
  const documentGroups = groupDocumentsByRegion(mappedDocuments, allRegionsLabel);
  const mappedFields = mapServiceFieldsForLocale(
    service.formFields,
    locale,
    allRegionsLabel,
  );
  const regionSupportNotes = getRegionSupportNotes(service.serviceRegions, locale);
  const requiredDocumentCount = mappedDocuments.filter(
    (doc) => doc.isRequired && doc.kind === "FILE",
  ).length;

  const serviceUrl = absoluteUrl(`/services/${service.slug}`);
  const breadcrumbItems = [
    { label: tNav("home"), href: "/" },
    { label: t("services.title"), href: "/services" },
    ...(categoryName
      ? [{ label: categoryName, href: "/services" as const }]
      : []),
    { label: name },
  ];
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: t("services.title"), url: absoluteUrl("/services") },
    ...(categoryName
      ? [{ name: categoryName, url: absoluteUrl("/services") }]
      : []),
    { name, url: serviceUrl },
  ]);
  const serviceJsonLd = buildServiceJsonLd({
    name,
    description: description || name,
    url: serviceUrl,
    areaServed,
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
        title={name}
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

            <ServiceOptionsSection
              serviceSlug={service.slug}
              serviceName={name}
              regionLabel={regionName}
              whatsappPhone={whatsappLinkNumber}
              whatsappDefaultMessage={whatsappMessage}
              locale={locale}
              labels={serviceOptionsLabels}
              hasSubServices={service.subServices.length > 0}
            />

            <ServiceRegionsList
              title={t("service.availableIn")}
              regions={assignedRegions}
              locale={locale}
            />

            <ServiceSubServices
              title={t("service.subServicesTitle")}
              description={t("service.subServicesDescription")}
              services={service.subServices}
              locale={locale}
              applyLabel={t("serviceOptions.accountSubServiceCta")}
            />

            <ServiceRegionNotes
              title={t("service.regionSupportTitle")}
              notes={regionSupportNotes}
            />

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

            <RelatedServices
              title={t("service.relatedTitle")}
              services={relatedServices}
              locale={locale}
              labels={buildServiceCardLabels(tCommon, t)}
            />
          </div>

          <ServiceInfoSidebar
            serviceName={name}
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
