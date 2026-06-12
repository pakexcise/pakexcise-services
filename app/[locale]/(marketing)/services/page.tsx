import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { ServiceCard } from "@/components/marketing/service-card";
import {
  buildBreadcrumbJsonLd,
} from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { pickLocalized } from "@/lib/i18n/content";
import { absoluteUrl } from "@/lib/utils";
import { seoMetaRepository, serviceRepository } from "@/server/repositories";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const t = await getTranslations({ locale, namespace: "marketing" });
  const seo = await seoMetaRepository.findByPageKey("services");

  return resolveMetadataFromSeo({
    locale,
    path: "/services",
    seo,
    fallbacks: {
      title: {
        en: t("services.metaTitle"),
        ur: t("services.metaTitle"),
      },
      description: {
        en: t("services.metaDescription"),
        ur: t("services.metaDescription"),
      },
      h1: {
        en: t("services.title"),
        ur: t("services.title"),
      },
    },
  });
}

export default async function ServicesPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("marketing");
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");
  const seo = await seoMetaRepository.findByPageKey("services");

  const { items: services } = await serviceRepository.listPublicPaginated(1, 50);

  const title = pickLocalized(locale, {
    en: seo?.h1En ?? t("services.title"),
    ur: seo?.h1Ur ?? t("services.title"),
  });
  const description = pickLocalized(locale, {
    en: seo?.metaDescriptionEn ?? t("services.metaDescription"),
    ur: seo?.metaDescriptionUr ?? t("services.metaDescription"),
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: title, url: absoluteUrl("/services") },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <PageHero
        title={title}
        description={description}
        breadcrumbs={[
          { label: tNav("home"), href: "/" },
          { label: title },
        ]}
      />
      <div className="container-site py-10 md:py-12">
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("services.empty")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                locale={locale}
                learnMoreLabel={tCommon("learnMore")}
                multipleRegionsLabel={t("services.multipleRegions")}
                allProvincesLabel={t("services.allProvinces")}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
