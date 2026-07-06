import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { ProvinceCard } from "@/components/marketing/province-card";
import { buildBreadcrumbJsonLd } from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { pickLocalized } from "@/lib/i18n/content";
import { absoluteUrl } from "@/lib/utils";
import { regionRepository, seoMetaRepository } from "@/server/repositories";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const t = await getTranslations({ locale, namespace: "marketing" });
  const seo = await seoMetaRepository.findByPageKey("regions");

  return await resolveMetadataFromSeo({
    locale,
    path: "/regions",
    seo,
    fallbacks: {
      title: {
        en: t("regions.metaTitle"),
        ur: t("regions.metaTitle"),
      },
      description: {
        en: t("regions.metaDescription"),
        ur: t("regions.metaDescription"),
      },
      h1: {
        en: t("regions.title"),
        ur: t("regions.title"),
      },
    },
  });
}

export default async function RegionsPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("marketing");
  const seo = await seoMetaRepository.findByPageKey("regions");
  const regions = await regionRepository.listPublic();

  const title = pickLocalized(locale, {
    en: seo?.h1En ?? t("regions.title"),
    ur: seo?.h1Ur ?? t("regions.title"),
  });
  const description = pickLocalized(locale, {
    en: seo?.metaDescriptionEn ?? t("regions.metaDescription"),
    ur: seo?.metaDescriptionUr ?? t("regions.metaDescription"),
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: title, url: absoluteUrl("/regions") },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <PageHero
        title={title}
        description={description}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: title },
        ]}
      />
      <div className="container-site space-y-8 py-10 md:py-12">
        {regions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("regions.empty")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {regions.map((region) => (
              <ProvinceCard
                key={region.id}
                region={region}
                locale={locale}
                viewLabel={t("regions.viewServices")}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
