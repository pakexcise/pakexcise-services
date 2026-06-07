import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/marketing/json-ld";
import { PageHero } from "@/components/marketing/page-hero";
import { ProseContent } from "@/components/marketing/prose-content";
import { TrackForm } from "@/components/marketing/track-form";
import { buildBreadcrumbJsonLd } from "@/features/seo/lib/metadata";
import { resolveMetadataFromSeo } from "@/features/seo/lib/resolve-metadata";
import { pickLocalized } from "@/lib/i18n/content";
import { absoluteUrl } from "@/lib/utils";
import { getPageContent, seoMetaRepository } from "@/server/repositories";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  const content = await getPageContent("track");
  const seo = await seoMetaRepository.findByPageKey("track");

  return resolveMetadataFromSeo({
    locale,
    path: "/track",
    seo,
    fallbacks: {
      title: {
        en: content?.titleEn ?? "Track Application | PakExcise.com",
        ur: content?.titleUr ?? "درخواست ٹریک کریں | PakExcise.com",
      },
      description: {
        en: content?.excerptEn ?? "Track your PakExcise application status.",
        ur: content?.excerptUr ?? "اپنی PakExcise درخواست کی حیثیت ٹریک کریں۔",
      },
      h1: {
        en: content?.titleEn ?? "Track your application",
        ur: content?.titleUr ?? "اپنی درخواست ٹریک کریں",
      },
    },
  });
}

export default async function TrackPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("marketing");
  const tNav = await getTranslations("nav");
  const [content, seo] = await Promise.all([
    getPageContent("track"),
    seoMetaRepository.findByPageKey("track"),
  ]);

  if (!content) {
    notFound();
  }

  const title = pickLocalized(locale, {
    en: seo?.h1En ?? content.titleEn,
    ur: seo?.h1Ur ?? content.titleUr,
  });
  const description = pickLocalized(locale, {
    en: content.excerptEn ?? "",
    ur: content.excerptUr ?? "",
  });
  const body = pickLocalized(locale, {
    en: content.contentEn,
    ur: content.contentUr,
  });

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: absoluteUrl("/") },
    { name: title, url: absoluteUrl("/track") },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <PageHero
        title={title}
        description={description || undefined}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: title },
        ]}
      />
      <div className="container-site space-y-8 py-10 md:py-12">
        <ProseContent content={body} />
        <TrackForm
          placeholder={t("track.inputLabel")}
          submitLabel={t("track.submitLabel")}
          helpText={t("track.helpText")}
          loginLabel={tNav("login")}
        />
      </div>
    </>
  );
}
