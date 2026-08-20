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

function pickSeoText(
  value: string | null | undefined,
  fallback: string,
): string {
  const trimmed = value?.trim();
  return trimmed || fallback;
}

export function resolvePageSeo(
  _locale: Locale | string,
  seo: SeoMeta | null,
  fallbacks: SeoFallbacks,
): ResolvedPageSeo {
  return {
    title: pickSeoText(seo?.metaTitleEn, fallbacks.title.en),
    description: pickSeoText(seo?.metaDescriptionEn, fallbacks.description.en),
    h1: pickSeoText(seo?.h1En, fallbacks.h1?.en ?? fallbacks.title.en),
  };
}

const SEO_TITLE_BRAND_SUFFIX =
  /\s*(?:[|\u2013\u2014-]\s*)?PakExcise(?:\.com)?\s*$/i;

const GENERIC_CITY_DESCRIPTION =
  /^Private excise facilitation support for .+, .+\.$/i;

function stripSeoBrandSuffix(value: string): string {
  return value.replace(SEO_TITLE_BRAND_SUFFIX, "").trim();
}

function looksLikeSeoTitle(value: string, metaTitle?: string | null): boolean {
  const normalized = stripSeoBrandSuffix(value);
  const normalizedMeta = stripSeoBrandSuffix(metaTitle?.trim() ?? "");

  if (!normalized) {
    return true;
  }

  if (normalizedMeta && normalized === normalizedMeta) {
    return true;
  }

  return /(?:\s[|\u2013\u2014-]\s*PakExcise|\| PakExcise)/i.test(value);
}

/** Visible page H1: prefer SeoMeta.h1En, never mirror the full SEO title tag. */
export function resolveVisibleH1(
  seo: { h1En?: string | null; metaTitleEn?: string | null } | null | undefined,
  fallback: string,
): string {
  const safeFallback = stripSeoBrandSuffix(fallback).trim() || fallback.trim();
  const rawH1 = seo?.h1En?.trim();

  if (!rawH1 || looksLikeSeoTitle(rawH1, seo?.metaTitleEn)) {
    return safeFallback;
  }

  return stripSeoBrandSuffix(rawH1) || safeFallback;
}

export function shouldIndexCityPage(city: {
  nameEn?: string | null;
  descriptionEn?: string | null;
  seoMeta?: Pick<SeoMeta, "robotsIndex"> | null;
}): boolean {
  if (city.seoMeta?.robotsIndex === false) {
    return false;
  }

  if (city.seoMeta?.robotsIndex === true) {
    return true;
  }

  const description = city.descriptionEn?.trim() ?? "";
  if (!description || description.length < 180) {
    return false;
  }

  if (GENERIC_CITY_DESCRIPTION.test(description)) {
    return false;
  }

  return true;
}

export async function resolveMetadataFromSeo(input: {
  locale: Locale | string;
  path: string;
  seo: SeoMeta | null;
  fallbacks: SeoFallbacks;
  /** When set, overrides stored SEO ogImage (e.g. blog featured image or logo fallback). */
  ogImage?: string | null;
  /** When set, overrides robots from SeoMeta (e.g. thin city pages). */
  robots?: { index: boolean; follow: boolean };
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
    canonical: input.seo?.canonicalUrl?.trim() || undefined,
    keywords: input.seo?.focusKeywords ?? undefined,
    ogTitle: pickSeoText(input.seo?.ogTitleEn, resolved.title),
    ogDescription: pickSeoText(input.seo?.ogDescriptionEn, resolved.description),
    ogImage: input.ogImage ?? input.seo?.ogImage ?? brandingDefaults.ogImage,
    twitterImage: brandingDefaults.twitterImage,
    siteName: brandingDefaults.siteName,
    twitterCard:
      input.seo?.twitterCard === "summary" ? "summary" : "summary_large_image",
    robots: input.robots ?? {
      index: input.seo?.robotsIndex ?? true,
      follow: input.seo?.robotsFollow ?? true,
    },
  });
}
