import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ViewServiceTracker } from "@/components/analytics/ViewServiceTracker";
import { DocumentChecklist } from "@/components/marketing/document-checklist";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { HowItWorksSteps } from "@/components/marketing/how-it-works-steps";
import { JsonLd } from "@/components/marketing/json-ld";
import { CTASection } from "@/components/marketing/cta-section";
import { PageHero } from "@/components/marketing/page-hero";
import { ProseContent } from "@/components/marketing/prose-content";
import { RelatedServices } from "@/components/marketing/related-services";
import { ServiceApplySidebar } from "@/components/marketing/service-apply-sidebar";
import { ServiceRegionsList } from "@/components/marketing/service-regions-list";
import { ServiceSubServices } from "@/components/marketing/service-sub-services";
import { mapFaqsForLocale } from "@/features/marketing/lib/map-faqs";
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
import { pickLocalized } from "@/lib/i18n/content";
import { absoluteUrl } from "@/lib/utils";
import {
  faqRepository,
  redirectRepository,
  serviceRepository,
} from "@/server/repositories";
import { getBusinessSettings } from "@/features/settings/lib/public-settings-cache";
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

  return resolveMetadataFromSeo({
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
  const documents = service.documentReqs.map((doc) => ({
    id: doc.id,
    label: pickLocalized(locale, { en: doc.labelEn, ur: doc.labelUr }),
    instructions: pickLocalized(locale, {
      en: doc.instructionsEn,
      ur: doc.instructionsUr,
    }),
    isRequired: doc.isRequired,
    scopeLabel: doc.region
      ? pickLocalized(locale, {
          en: doc.region.nameEn,
          ur: doc.region.nameUr,
        })
      : allRegionsLabel,
  }));
  const requiredDocumentCount = documents.filter((doc) => doc.isRequired).length;

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
  const faqJsonLd =
    faqItems.length > 0 ? buildFaqJsonLd(faqItems) : null;

  const applyHref =
    service.subServices.length > 0
      ? undefined
      : `/apply/${service.slug}`;

  return (
    <>
      <ViewServiceTracker serviceSlug={service.slug} serviceId={service.id} />
      <JsonLd
        data={
          faqJsonLd
            ? [breadcrumbJsonLd, serviceJsonLd, faqJsonLd]
            : [breadcrumbJsonLd, serviceJsonLd]
        }
      />
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
              applyLabel={tCommon("learnMore")}
            />

            {processingNotes?.trim() ? (
              <section className="space-y-3 rounded-xl border bg-muted/30 p-5">
                <h2 className="text-xl font-bold">{t("service.importantNotes")}</h2>
                <ProseContent content={processingNotes} />
              </section>
            ) : null}

            <DocumentChecklist
              title={t("service.documentsTitle")}
              items={documents}
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
              learnMoreLabel={tCommon("learnMore")}
              multipleRegionsLabel={t("services.multipleRegions")}
              allProvincesLabel={t("services.allProvinces")}
            />
          </div>

          <ServiceApplySidebar
            serviceName={name}
            regionLabel={regionName}
            documentCount={documents.length}
            requiredDocumentCount={requiredDocumentCount}
            applyHref={applyHref ?? `/services/${service.slug}#sub-services`}
            applyLabel={
              service.subServices.length > 0
                ? t("service.chooseSubService")
                : t("service.applyNow")
            }
            whatsappLabel={tCommon("whatsappHelp")}
            whatsappPhone={businessSettings.whatsappNumber}
            whatsappMessage={businessSettings.whatsappDefaultMessage}
            documentsLabel={t("service.documentsTitle")}
            regionLabelTitle={t("service.availableIn")}
            ctaTitle={t("service.ctaTitle")}
            ctaDescription={t("service.ctaDescription")}
          />
        </div>

        {applyHref ? (
          <div className="mt-12 lg:hidden">
            <CTASection
              title={t("service.ctaTitle")}
              description={t("service.ctaDescription")}
              applyLabel={t("service.applyNow")}
              applyHref={applyHref}
              whatsappLabel={tCommon("whatsappHelp")}
              whatsappPhone={businessSettings.whatsappNumber}
              whatsappMessage={businessSettings.whatsappDefaultMessage}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
