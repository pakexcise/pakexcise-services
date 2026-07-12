import { copy, createT } from "@/messages";
import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { ServiceCategorySection } from "@/components/marketing/service-category-section";
import { ServicesCategoryNav } from "@/components/marketing/services-category-nav";
import { ServicesEmptyState } from "@/components/marketing/services-empty-state";
import {
  buildBreadcrumbJsonLd,
  buildItemListJsonLd} from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { buildServiceCardLabels } from "@/features/marketing/lib/build-service-card-labels";
import { seoAbsoluteUrl } from "@/lib/seo-url";
import { seoMetaRepository } from "@/server/repositories";
import { serviceCategoryRepository } from "@/server/repositories/service-category-repository";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = "en";
  const t = await getTranslations("marketing");
  const seo = await seoMetaRepository.findByPageKey("services");

  return await resolveMetadataFromSeo({
    locale,
    path: "/services",
    seo,
    fallbacks: {
      title: {
        en: t("services.metaTitle"),
      },
      description: {
        en: t("services.metaDescription"),
      },
      h1: {
        en: t("services.title"),
      },
    },
  });
}

export default async function ServicesPage() {
  const locale = "en";

  const t = createT(copy.marketing);
  const tNav = createT(copy.nav);
  const tCommon = createT(copy.common);
  const seo = await seoMetaRepository.findByPageKey("services");

  const categoryGroups = await serviceCategoryRepository.listPublicGrouped();

  const title = seo?.h1En ?? t("services.title");
  const description = seo?.metaDescriptionEn ?? t("services.metaDescription");

  const serviceListItems = categoryGroups.flatMap((group) =>
    group.services.map((service) => ({
      name: service.nameEn ?? "",
      url: seoAbsoluteUrl(`/services/${service.slug}`)})),
  );

  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: seoAbsoluteUrl("/") },
      { name: title, url: seoAbsoluteUrl("/services") }]),
    buildItemListJsonLd({
      name: title,
      items: serviceListItems})].filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const hasServices = categoryGroups.length > 0;
  const serviceCardLabels = buildServiceCardLabels(tCommon, t);

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        title={title}
        description={description}
        breadcrumbs={[
          { label: tNav("home"), href: "/" },
          { label: title }]}
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
                labels={serviceCardLabels}
              />
            ))}
          </>
        )}
      </div>
    </>
  );
}
