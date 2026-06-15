import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { ServiceCategorySection } from "@/components/marketing/service-category-section";
import { ServicesCategoryNav } from "@/components/marketing/services-category-nav";
import { ServicesEmptyState } from "@/components/marketing/services-empty-state";
import {
  buildBreadcrumbJsonLd,
} from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { pickLocalized } from "@/lib/i18n/content";
import { absoluteUrl } from "@/lib/utils";
import { seoMetaRepository } from "@/server/repositories";
import { serviceCategoryRepository } from "@/server/repositories/service-category-repository";
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

  const categoryGroups = await serviceCategoryRepository.listPublicGrouped();

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

  const hasServices = categoryGroups.length > 0;

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
      <div className="container-site space-y-10 py-10 md:space-y-12 md:py-12">
        {!hasServices ? (
          <ServicesEmptyState
            title={t("services.emptyTitle")}
            description={t("services.empty")}
            browseRegionsLabel={t("services.browseRegions")}
            contactLabel={tNav("contact")}
          />
        ) : (
          <>
            <ServicesCategoryNav
              groups={categoryGroups}
              locale={locale}
              label={t("services.jumpToCategory")}
            />
            {categoryGroups.map((group) => (
              <ServiceCategorySection
                key={group.id}
                group={group}
                locale={locale}
                learnMoreLabel={tCommon("learnMore")}
                multipleRegionsLabel={t("services.multipleRegions")}
                allProvincesLabel={t("services.allProvinces")}
              />
            ))}
          </>
        )}
      </div>
    </>
  );
}
