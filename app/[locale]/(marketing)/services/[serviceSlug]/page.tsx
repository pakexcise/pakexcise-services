import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ViewServiceTracker } from "@/components/analytics/ViewServiceTracker";
import { DocumentChecklist } from "@/components/marketing/document-checklist";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { JsonLd } from "@/components/marketing/json-ld";
import { MarketingCta } from "@/components/marketing/marketing-cta";
import { PageHero } from "@/components/marketing/page-hero";
import { ProseContent } from "@/components/marketing/prose-content";
import { ServiceCard } from "@/components/marketing/service-card";
import { mapFaqsForLocale } from "@/features/marketing/lib/map-faqs";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildServiceJsonLd,
} from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { redirect } from "@/i18n/navigation";
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

  const [serviceFaqs, relatedServices, businessSettings] = await Promise.all([
    faqRepository.listByServiceId(service.id),
    serviceRepository.listRelatedServices(service.id, service.regionId, 3),
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
  const regionName = pickLocalized(locale, {
    en: service.region.nameEn,
    ur: service.region.nameUr,
  });

  const faqItems = mapFaqsForLocale(serviceFaqs, locale);
  const documents = service.documentReqs.map((doc) => ({
    id: doc.id,
    label: pickLocalized(locale, { en: doc.labelEn, ur: doc.labelUr }),
    instructions: pickLocalized(locale, {
      en: doc.instructionsEn,
      ur: doc.instructionsUr,
    }),
    isRequired: doc.isRequired,
  }));

  const serviceUrl = absoluteUrl(`/services/${service.slug}`);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: t("services.title"), url: absoluteUrl("/services") },
    { name, url: serviceUrl },
  ]);
  const serviceJsonLd = buildServiceJsonLd({
    name,
    description: description || name,
    url: serviceUrl,
    areaServed: regionName,
  });
  const faqJsonLd =
    faqItems.length > 0 ? buildFaqJsonLd(faqItems) : null;

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
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: t("services.title"), href: "/services" },
          { label: name },
        ]}
      />

      <div className="container-site space-y-12 py-10 md:py-12">
        <section className="space-y-2">
          <p className="text-sm font-medium text-primary">{regionName}</p>
          <ProseContent content={content ?? ""} />
        </section>

        <DocumentChecklist
          title={t("service.documentsTitle")}
          items={documents}
          requiredLabel={t("service.required")}
          optionalLabel={t("service.optional")}
          emptyMessage={t("service.documentsEmpty")}
        />

        <HowItWorks
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

        <MarketingCta
          title={t("service.ctaTitle")}
          description={t("service.ctaDescription")}
          applyLabel={t("service.applyNow")}
          applyHref={`/apply/${service.slug}`}
          whatsappLabel={tCommon("whatsappHelp")}
          whatsappPhone={businessSettings.whatsappNumber}
          whatsappMessage={businessSettings.whatsappDefaultMessage}
        />

        {relatedServices.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">{t("service.relatedTitle")}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedServices.map((related) => (
                <ServiceCard
                  key={related.id}
                  service={related}
                  locale={locale}
                  learnMoreLabel={tCommon("learnMore")}
                />
              ))}
            </div>
          </section>
        ) : null}

      </div>
    </>
  );
}
