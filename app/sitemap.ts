import type { MetadataRoute } from "next";

import { shouldAllowSearchIndexing } from "@/config/env.server";
import { getFeatureFlagSettings, getSeoSettings } from "@/features/settings/lib/public-settings-cache";
import { shouldIndexCityPage } from "@/features/seo/lib/resolve-metadata";
import { seoAbsoluteUrl } from "@/lib/seo-url";
import {
  blogPostRepository,
  cityRepository,
  regionRepository,
  serviceRepository,
} from "@/server/repositories";

const staticPaths: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/services", priority: 0.9, changeFrequency: "weekly" },
  { path: "/regions", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/how-it-works", priority: 0.7, changeFrequency: "monthly" },
  { path: "/documents", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faqs", priority: 0.7, changeFrequency: "weekly" },
  { path: "/track", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  { path: "/reviews", priority: 0.5, changeFrequency: "monthly" },
  { path: "/agents", priority: 0.4, changeFrequency: "monthly" },
  { path: "/agent-register", priority: 0.4, changeFrequency: "monthly" },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms-and-conditions", priority: 0.3, changeFrequency: "yearly" },
  { path: "/disclaimer", priority: 0.3, changeFrequency: "yearly" },
  { path: "/refund-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/payment-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/cookie-policy", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!shouldAllowSearchIndexing()) {
    return [];
  }

  const [featureFlags, seoSettings] = await Promise.all([
    getFeatureFlagSettings(),
    getSeoSettings(),
  ]);

  if (!seoSettings.sitemapEnabled) {
    return [];
  }

  const [services, regions, cities, posts] = await Promise.all([
    serviceRepository.listActiveSlugs().catch(() => []),
    regionRepository.listActiveSlugs().catch(() => []),
    cityRepository.listActiveSlugs().catch(() => []),
    featureFlags.blogEnabled
      ? blogPostRepository.listPublished().catch(() => [])
      : Promise.resolve([]),
  ]);

  const activeStaticPaths = staticPaths.filter((entry) => {
    if (entry.path === "/blog") {
      return featureFlags.blogEnabled;
    }

    if (entry.path === "/reviews") {
      return featureFlags.reviewsEnabled;
    }

    return true;
  });

  const staticEntries: MetadataRoute.Sitemap = activeStaticPaths.map((entry) => ({
    url: seoAbsoluteUrl(entry.path),
    lastModified: new Date(),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  const serviceEntries: MetadataRoute.Sitemap = services.map((service) => ({
    url: seoAbsoluteUrl(`/services/${service.slug}`),
    lastModified: service.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const regionEntries: MetadataRoute.Sitemap = regions.map((region) => ({
    url: seoAbsoluteUrl(`/regions/${region.slug}`),
    lastModified: region.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const cityEntries: MetadataRoute.Sitemap = (
    await Promise.all(
      cities.map(async (city) => {
        const full = await cityRepository.findPublicByRegionSlugAndCitySlug(
          city.regionSlug,
          city.citySlug,
        );
        if (!full || !shouldIndexCityPage(full)) {
          return null;
        }
        return {
          url: seoAbsoluteUrl(`/regions/${city.regionSlug}/${city.citySlug}`),
          lastModified: city.updatedAt,
          changeFrequency: "weekly" as const,
          priority: 0.65,
        };
      }),
    )
  ).filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: seoAbsoluteUrl(`/blog/${post.slug}`),
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...serviceEntries,
    ...regionEntries,
    ...cityEntries,
    ...blogEntries,
  ];
}
