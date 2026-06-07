import type { Metadata } from "next";
import type { SeoMeta } from "@prisma/client";

import { buildMetadata } from "@/features/seo/lib/metadata";
import { buildHreflangAlternates } from "@/features/seo/lib/hreflang";
import type { Locale } from "@/i18n/config";
import { pickLocalized } from "@/lib/i18n/content";

export type SeoFallbacks = {
  title: { en: string; ur: string };
  description: { en: string; ur: string };
  h1?: { en: string; ur: string };
};

export type ResolvedPageSeo = {
  title: string;
  description: string;
  h1: string;
};

export function resolvePageSeo(
  locale: Locale | string,
  seo: SeoMeta | null,
  fallbacks: SeoFallbacks,
): ResolvedPageSeo {
  return {
    title: pickLocalized(locale, {
      en: seo?.metaTitleEn ?? fallbacks.title.en,
      ur: seo?.metaTitleUr ?? fallbacks.title.ur,
    }),
    description: pickLocalized(locale, {
      en: seo?.metaDescriptionEn ?? fallbacks.description.en,
      ur: seo?.metaDescriptionUr ?? fallbacks.description.ur,
    }),
    h1: pickLocalized(locale, {
      en: seo?.h1En ?? fallbacks.h1?.en ?? fallbacks.title.en,
      ur: seo?.h1Ur ?? fallbacks.h1?.ur ?? fallbacks.title.ur,
    }),
  };
}

export function resolveMetadataFromSeo(input: {
  locale: Locale | string;
  path: string;
  seo: SeoMeta | null;
  fallbacks: SeoFallbacks;
}): Metadata {
  const resolved = resolvePageSeo(input.locale, input.seo, input.fallbacks);

  return buildMetadata({
    title: resolved.title,
    description: resolved.description,
    locale: input.locale,
    path: input.path,
    canonical: input.seo?.canonicalUrl ?? undefined,
    ogTitle: pickLocalized(input.locale, {
      en: input.seo?.ogTitleEn ?? resolved.title,
      ur: input.seo?.ogTitleUr ?? resolved.title,
    }),
    ogDescription: pickLocalized(input.locale, {
      en: input.seo?.ogDescriptionEn ?? resolved.description,
      ur: input.seo?.ogDescriptionUr ?? resolved.description,
    }),
    ogImage: input.seo?.ogImage,
    twitterCard:
      input.seo?.twitterCard === "summary" ? "summary" : "summary_large_image",
    robots: {
      index: input.seo?.robotsIndex ?? true,
      follow: input.seo?.robotsFollow ?? true,
    },
    alternates: buildHreflangAlternates(input.path),
  });
}
