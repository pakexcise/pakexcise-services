import type { Metadata } from "next";

import { brandingAssets, getDefaultOgImagePath } from "@/config/branding";
import { shouldAllowSearchIndexing } from "@/config/env.server";
import type { SeoSettings } from "@/features/settings/types";
import {
  resolveSeoCanonicalUrl,
  resolveSeoImageUrl,
  seoAbsoluteUrl,
} from "@/lib/seo-url";
import { publicPath } from "@/lib/utils";

export type SeoInput = {
  title: string;
  description: string;
  locale: string;
  path: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string | null;
  twitterCard?: "summary" | "summary_large_image";
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
  alternates?: Record<string, string>;
};

function buildNonProductionMetadata(input: SeoInput): Metadata {
  return {
    title: input.title,
    description: input.description,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    openGraph: {
      title: input.ogTitle ?? input.title,
      description: input.ogDescription ?? input.description,
      siteName: "PakExcise.com",
      locale: input.locale === "ur" ? "ur_PK" : "en_PK",
      type: "website",
    },
    twitter: {
      card: input.twitterCard ?? "summary_large_image",
      title: input.ogTitle ?? input.title,
      description: input.ogDescription ?? input.description,
    },
  };
}

export function buildMetadata(input: SeoInput): Metadata {
  if (!shouldAllowSearchIndexing()) {
    return buildNonProductionMetadata(input);
  }

  const canonical =
    resolveSeoCanonicalUrl({
      path: input.path,
      canonical: input.canonical,
    }) ?? seoAbsoluteUrl(publicPath(input.path));
  const ogTitle = input.ogTitle ?? input.title;
  const ogDescription = input.ogDescription ?? input.description;
  const ogImage =
    resolveSeoImageUrl(input.ogImage) ??
    resolveSeoImageUrl(getDefaultOgImagePath(input.locale));

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical,
      languages: input.alternates,
    },
    robots: {
      index: input.robots?.index ?? true,
      follow: input.robots?.follow ?? true,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName: "PakExcise.com",
      locale: input.locale === "ur" ? "ur_PK" : "en_PK",
      type: "website",
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }]
        : undefined,
    },
    twitter: {
      card: input.twitterCard ?? "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function resolveLogoUrl(baseUrl: string, logoPath: string): string {
  if (logoPath.startsWith("http")) {
    return logoPath;
  }

  return `${baseUrl}${logoPath.startsWith("/") ? logoPath : `/${logoPath}`}`;
}

export function buildOrganizationJsonLd(
  baseUrl: string,
  seo?: Pick<
    SeoSettings,
    | "organizationName"
    | "organizationDescriptionEn"
    | "organizationLogoPath"
    | "organizationAreaServed"
  >,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: seo?.organizationName ?? "PakExcise.com",
    url: baseUrl,
    logo: resolveLogoUrl(
      baseUrl,
      seo?.organizationLogoPath ?? brandingAssets.logo,
    ),
    description:
      seo?.organizationDescriptionEn ??
      "Private excise facilitation service for Pakistan. Not affiliated with any government body.",
    areaServed: {
      "@type": "Country",
      name: seo?.organizationAreaServed ?? "Pakistan",
    },
  };
}

export function buildWebSiteJsonLd(
  baseUrl: string,
  siteName = "PakExcise.com",
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: baseUrl,
    inLanguage: ["en-PK", "ur-PK"],
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/services?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildLocalBusinessJsonLd(
  baseUrl: string,
  seo?: Pick<
    SeoSettings,
    | "localBusinessName"
    | "localBusinessDescriptionEn"
    | "localBusinessAreaServed"
    | "localBusinessPriceRange"
  >,
) {
  const payload: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: seo?.localBusinessName ?? "PakExcise.com",
    url: baseUrl,
    description:
      seo?.localBusinessDescriptionEn ??
      "Private excise facilitation service for Pakistan. Not affiliated with any government body.",
    areaServed: seo?.localBusinessAreaServed ?? "Pakistan",
  };

  const priceRange = seo?.localBusinessPriceRange?.trim();
  if (priceRange) {
    payload.priceRange = priceRange;
  }

  return payload;
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildFaqJsonLd(
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildServiceJsonLd(input: {
  name: string;
  description: string;
  url: string;
  areaServed?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: input.url,
    provider: {
      "@type": "Organization",
      name: "PakExcise.com",
    },
    areaServed: input.areaServed ?? "Pakistan",
  };
}
