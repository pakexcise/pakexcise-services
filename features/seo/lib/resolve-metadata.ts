import type { Metadata } from "next";
import type { SeoMeta } from "@prisma/client";

import { buildMetadata, resolveBrandingMetadataDefaults } from "@/features/seo/lib/metadata";
import {
  getBrandingSettings,
  getBusinessSettings,
} from "@/features/settings/lib/public-settings-cache";

type Locale = "en";

export type SeoFallbacks = {
  title: { en: string };
  description: { en: string };
  h1?: { en: string };
};

export type ResolvedPageSeo = {
  title: string;
  description: string;
  h1: string;
};

export function resolvePageSeo(
  _locale: Locale | string,
  seo: SeoMeta | null,
  fallbacks: SeoFallbacks,
): ResolvedPageSeo {
  return {
    title: seo?.metaTitleEn ?? fallbacks.title.en,
    description: seo?.metaDescriptionEn ?? fallbacks.description.en,
    h1: seo?.h1En ?? fallbacks.h1?.en ?? fallbacks.title.en,
  };
}

export async function resolveMetadataFromSeo(input: {
  locale: Locale | string;
  path: string;
  seo: SeoMeta | null;
  fallbacks: SeoFallbacks;
  /** When set, overrides stored SEO ogImage (e.g. blog featured image or logo fallback). */
  ogImage?: string | null;
}): Promise<Metadata> {
  const [branding, business] = await Promise.all([
    getBrandingSettings(),
    getBusinessSettings(),
  ]);
  const resolved = resolvePageSeo(input.locale, input.seo, input.fallbacks);
  const brandingDefaults = resolveBrandingMetadataDefaults(
    branding,
    input.locale,
    business.siteName,
  );

  return buildMetadata({
    title: resolved.title,
    description: resolved.description,
    locale: input.locale,
    path: input.path,
    canonical: input.seo?.canonicalUrl ?? undefined,
    ogTitle: input.seo?.ogTitleEn ?? resolved.title,
    ogDescription: input.seo?.ogDescriptionEn ?? resolved.description,
    ogImage: input.ogImage ?? input.seo?.ogImage ?? brandingDefaults.ogImage,
    twitterImage: brandingDefaults.twitterImage,
    siteName: brandingDefaults.siteName,
    twitterCard:
      input.seo?.twitterCard === "summary" ? "summary" : "summary_large_image",
    robots: {
      index: input.seo?.robotsIndex ?? true,
      follow: input.seo?.robotsFollow ?? true,
    },
  });
}
