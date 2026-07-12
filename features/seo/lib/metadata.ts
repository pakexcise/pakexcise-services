import type { Metadata } from "next";

import { brandingAssets } from "@/config/branding";
import { shouldAllowSearchIndexing } from "@/config/env.server";
import {
  resolveDefaultOgImagePath,
  resolveDefaultTwitterImagePath,
} from "@/features/settings/lib/branding-resolvers";
import type { BrandingSettings } from "@/features/settings/types";
import type { SeoSettings } from "@/features/settings/types";
import {
  buildContactPointNodes,
  buildPostalAddressJsonLd,
  dedupeSameAs,
  normalizeJsonLdText,
  normalizeTelephoneForJsonLd,
  organizationId,
  type JsonLdContactPointInput,
  websiteId,
} from "@/features/seo/lib/json-ld-helpers";
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
  twitterImage?: string | null;
  twitterCard?: "summary" | "summary_large_image";
  siteName?: string;
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
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
      siteName: input.siteName ?? "PakExcise.com",
      locale: "en_PK",
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
  const ogImage = resolveSeoImageUrl(input.ogImage);
  const twitterImage = resolveSeoImageUrl(input.twitterImage) ?? ogImage;
  const siteName = input.siteName ?? "PakExcise.com";

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical,
    },
    robots: {
      index: input.robots?.index ?? true,
      follow: input.robots?.follow ?? true,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName,
      locale: "en_PK",
      type: "website",
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }]
        : undefined,
    },
    twitter: {
      card: input.twitterCard ?? "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: twitterImage ? [twitterImage] : undefined,
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
  seo?: Partial<
    Pick<
      SeoSettings,
      | "organizationName"
      | "organizationDescriptionEn"
      | "organizationLogoPath"
      | "organizationAreaServed"
    >
  >,
  branding?: Pick<BrandingSettings, "logoPath">,
  options?: {
    sameAs?: string[];
    contactPoints?: JsonLdContactPointInput[];
  },
) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  const payload: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId(normalizedBaseUrl),
    name: seo?.organizationName ?? "PakExcise.com",
    url: normalizedBaseUrl,
    logo: resolveLogoUrl(
      normalizedBaseUrl,
      seo?.organizationLogoPath ?? branding?.logoPath ?? brandingAssets.logo,
    ),
    description:
      seo?.organizationDescriptionEn ??
      "Private excise facilitation service for Pakistan. Not affiliated with any government body.",
    areaServed: {
      "@type": "Country",
      name: seo?.organizationAreaServed ?? "Pakistan",
    },
  };

  const sameAs = dedupeSameAs(options?.sameAs ?? []);
  if (sameAs.length > 0) {
    payload.sameAs = sameAs;
  }

  const contactPoint = buildContactPointNodes(options?.contactPoints ?? []);
  if (contactPoint.length > 0) {
    payload.contactPoint = contactPoint;
  }

  return payload;
}

export function buildWebSiteJsonLd(
  baseUrl: string,
  siteName = "PakExcise.com",
) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId(normalizedBaseUrl),
    name: siteName,
    url: normalizedBaseUrl,
    inLanguage: ["en-PK"],
    publisher: {
      "@id": organizationId(normalizedBaseUrl),
    },
  };
}

export function buildLocalBusinessJsonLd(
  baseUrl: string,
  seo?: Partial<
    Pick<
      SeoSettings,
      | "localBusinessName"
      | "localBusinessDescriptionEn"
      | "localBusinessAreaServed"
      | "localBusinessPriceRange"
      | "localBusinessTelephone"
      | "localBusinessStreetAddress"
      | "localBusinessAddressLocality"
      | "localBusinessPostalCode"
      | "localBusinessAddressCountry"
    >
  >,
  options?: {
    telephone?: string;
    imageUrl?: string;
  },
) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  const payload: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: seo?.localBusinessName ?? "PakExcise.com",
    url: normalizedBaseUrl,
    description:
      seo?.localBusinessDescriptionEn ??
      "Private excise facilitation service for Pakistan. Not affiliated with any government body.",
    areaServed: seo?.localBusinessAreaServed ?? "Pakistan",
    parentOrganization: {
      "@id": organizationId(normalizedBaseUrl),
    },
  };

  const telephone = normalizeTelephoneForJsonLd(
    seo?.localBusinessTelephone ?? options?.telephone,
  );
  if (telephone) {
    payload.telephone = telephone;
  }

  const address = buildPostalAddressJsonLd({
    streetAddress: seo?.localBusinessStreetAddress ?? "",
    addressLocality: seo?.localBusinessAddressLocality ?? "",
    postalCode: seo?.localBusinessPostalCode ?? "",
    addressCountry: seo?.localBusinessAddressCountry,
  });
  if (address) {
    payload.address = address;
  }

  if (options?.imageUrl) {
    payload.image = options.imageUrl;
  }

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
  const mainEntity = faqs
    .map((faq) => {
      const question = normalizeJsonLdText(faq.question, 300);
      const answer = normalizeJsonLdText(faq.answer, 5000);

      if (!question || !answer) {
        return null;
      }

      return {
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (mainEntity.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}

export function buildServiceJsonLd(input: {
  name: string;
  description: string;
  url: string;
  areaServed?: string;
  providerName?: string;
  serviceType?: string;
}) {
  const description = normalizeJsonLdText(input.description, 5000);

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: normalizeJsonLdText(input.name, 200),
    description,
    url: input.url,
    provider: {
      "@type": "Organization",
      name: input.providerName ?? "PakExcise.com",
    },
    areaServed: input.areaServed ?? "Pakistan",
    ...(input.serviceType
      ? { serviceType: normalizeJsonLdText(input.serviceType, 120) }
      : {}),
  };
}

export function buildItemListJsonLd(input: {
  name: string;
  items: Array<{ name: string; url: string }>;
}) {
  const itemListElement = input.items
    .map((item, index) => {
      const name = normalizeJsonLdText(item.name, 200);
      if (!name) {
        return null;
      }

      return {
        "@type": "ListItem",
        position: index + 1,
        name,
        url: item.url,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (itemListElement.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: normalizeJsonLdText(input.name, 200),
    itemListElement,
  };
}

export function buildArticleJsonLd(input: {
  type: "BlogPosting" | "Article";
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  imageUrl?: string;
  authorName?: string;
  publisherName?: string;
  publisherLogoUrl?: string;
  inLanguage: string;
}) {
  const headline = normalizeJsonLdText(input.headline, 200);
  const description = normalizeJsonLdText(input.description, 5000);

  const payload: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": input.type,
    headline,
    description,
    url: input.url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": input.url,
    },
    inLanguage: input.inLanguage,
    author: {
      "@type": "Organization",
      name: input.authorName ?? input.publisherName ?? "PakExcise.com",
    },
    publisher: {
      "@type": "Organization",
      name: input.publisherName ?? "PakExcise.com",
      ...(input.publisherLogoUrl
        ? {
            logo: {
              "@type": "ImageObject",
              url: input.publisherLogoUrl,
            },
          }
        : {}),
    },
  };

  if (input.datePublished) {
    payload.datePublished = input.datePublished;
  }

  if (input.dateModified) {
    payload.dateModified = input.dateModified;
  }

  if (input.imageUrl) {
    payload.image = [input.imageUrl];
  }

  return payload;
}

export function buildContactPageJsonLd(input: {
  pageUrl: string;
  pageName: string;
  description: string;
  organizationName: string;
  baseUrl: string;
  contactPoints: JsonLdContactPointInput[];
  sameAs?: string[];
}) {
  const normalizedBaseUrl = input.baseUrl.replace(/\/$/, "");
  const orgId = organizationId(normalizedBaseUrl);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": input.pageUrl,
        url: input.pageUrl,
        name: normalizeJsonLdText(input.pageName, 200),
        description: normalizeJsonLdText(input.description, 5000),
        isPartOf: {
          "@id": websiteId(normalizedBaseUrl),
        },
        about: {
          "@id": orgId,
        },
      },
      buildOrganizationJsonLd(
        normalizedBaseUrl,
        {
          organizationName: input.organizationName,
        },
        undefined,
        {
          sameAs: input.sameAs,
          contactPoints: input.contactPoints,
        },
      ),
    ],
  };
}

export type ReviewJsonLdInput = {
  authorName: string;
  content: string;
  rating: number;
};

export function buildReviewsJsonLd(input: {
  pageUrl: string;
  itemReviewedName: string;
  itemReviewedUrl: string;
  reviews: ReviewJsonLdInput[];
}) {
  return input.reviews
    .map((review) => {
      const reviewBody = normalizeJsonLdText(review.content, 5000);
      const authorName = normalizeJsonLdText(review.authorName, 120);

      if (!reviewBody || !authorName) {
        return null;
      }

      const ratingValue = Math.min(5, Math.max(1, Math.round(review.rating)));

      return {
        "@context": "https://schema.org",
        "@type": "Review",
        url: input.pageUrl,
        itemReviewed: {
          "@type": "Organization",
          name: input.itemReviewedName,
          url: input.itemReviewedUrl,
        },
        author: {
          "@type": "Person",
          name: authorName,
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue,
          bestRating: 5,
          worstRating: 1,
        },
        reviewBody,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

export function buildBusinessContactPoints(input: {
  phone?: string | null;
  email?: string | null;
  whatsappUrl?: string | null;
  whatsappChannelUrl?: string | null;
}): JsonLdContactPointInput[] {
  const points: JsonLdContactPointInput[] = [
    {
      contactType: "customer support",
      areaServed: "PK",
      availableLanguage: ["English"],
      ...(input.phone?.trim() ? { telephone: input.phone.trim() } : {}),
      ...(input.email?.trim() ? { email: input.email.trim() } : {}),
    },
  ];

  if (input.whatsappUrl?.trim()) {
    points.push({
      contactType: "customer support",
      url: input.whatsappUrl.trim(),
      areaServed: "PK",
      availableLanguage: ["English"],
    });
  }

  if (input.whatsappChannelUrl?.trim()) {
    points.push({
      contactType: "customer support",
      url: input.whatsappChannelUrl.trim(),
      areaServed: "PK",
    });
  }

  return points;
}

export function resolveBrandingMetadataDefaults(
  branding: BrandingSettings,
  locale: string,
  siteName?: string,
): Pick<SeoInput, "ogImage" | "twitterImage" | "siteName"> {
  return {
    ogImage: resolveDefaultOgImagePath(branding),
    twitterImage: resolveDefaultTwitterImagePath(branding),
    siteName: siteName?.trim() || "PakExcise.com",
  };
}
