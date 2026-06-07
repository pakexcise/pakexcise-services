import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
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

  return resolveMetadataFromSeo({
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
  const seo = await seoMetaRepository.findByPageKey("faqs");
  const faqs = await faqRepository.listGlobalPublic();
  const faqItems = mapFaqsForLocale(faqs, locale);

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
          { label: "Home", href: "/" },
          { label: title },
        ]}
      />
      <div className="container-site py-10 md:py-12">
        <FaqAccordion
          items={faqItems}
          emptyMessage={t("faqs.empty")}
        />
      </div>
    </>
  );
}
