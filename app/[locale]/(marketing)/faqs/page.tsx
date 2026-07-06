import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { FaqExplorer } from "@/components/marketing/faq-explorer";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { groupFaqsByCategory } from "@/features/marketing/lib/group-faqs-by-category";
import { mapFaqsForLocale } from "@/features/marketing/lib/map-faqs";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { pickLocalized } from "@/lib/i18n/content";
import { absoluteUrl } from "@/lib/utils";
import { faqRepository, seoMetaRepository } from "@/server/repositories";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const t = await getTranslations({ locale, namespace: "marketing" });
  const seo = await seoMetaRepository.findByPageKey("faqs");

  return await resolveMetadataFromSeo({
    locale,
    path: "/faqs",
    seo,
    fallbacks: {
      title: {
        en: t("faqs.metaTitle"),
        ur: t("faqs.metaTitle"),
      },
      description: {
        en: t("faqs.metaDescription"),
        ur: t("faqs.metaDescription"),
      },
      h1: {
        en: t("faqs.title"),
        ur: t("faqs.title"),
      },
    },
  });
}

export default async function FaqsPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("marketing");
  const tNav = await getTranslations("nav");
  const seo = await seoMetaRepository.findByPageKey("faqs");
  const faqs = await faqRepository.listAllPublic();
  const faqItems = mapFaqsForLocale(faqs, locale);
  const groupedFaqs = groupFaqsByCategory(faqs, locale);

  const title = pickLocalized(locale, {
    en: seo?.h1En ?? t("faqs.title"),
    ur: seo?.h1Ur ?? t("faqs.title"),
  });
  const description = pickLocalized(locale, {
    en: seo?.metaDescriptionEn ?? t("faqs.metaDescription"),
    ur: seo?.metaDescriptionUr ?? t("faqs.metaDescription"),
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: title, url: absoluteUrl("/faqs") },
  ]);
  const faqJsonLd =
    faqItems.length > 0 ? buildFaqJsonLd(faqItems) : null;

  return (
    <>
      <JsonLd
        data={faqJsonLd ? [breadcrumbJsonLd, faqJsonLd] : breadcrumbJsonLd}
      />
      <PageHero
        title={title}
        description={description}
        breadcrumbs={[
          { label: tNav("home"), href: "/" },
          { label: title },
        ]}
      />
      <div className="container-site py-10 md:py-12">
        {groupedFaqs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("faqs.empty")}</p>
        ) : (
          <FaqExplorer
            groups={groupedFaqs}
            labels={{
              searchPlaceholder: t("faqs.searchPlaceholder"),
              allCategories: t("faqs.allCategories"),
              noResults: t("faqs.noResults"),
            }}
          />
        )}
      </div>
    </>
  );
}
