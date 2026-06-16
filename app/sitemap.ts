import type { MetadataRoute } from "next";

import { getFeatureFlagSettings, getSeoSettings } from "@/features/settings/lib/public-settings-cache";
import { absoluteUrl } from "@/lib/utils";
import {
  blogPostRepository,
  cityRepository,
  guideRepository,
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
  { path: "/guides", priority: 0.7, changeFrequency: "weekly" },
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
  const [featureFlags, seoSettings] = await Promise.all([
    getFeatureFlagSettings(),
    getSeoSettings(),
  ]);

  if (!seoSettings.sitemapEnabled) {
    return [];
  }

  const [services, regions, cities, guides, posts] = await Promise.all([
    serviceRepository.listActiveSlugs().catch(() => []),
    regionRepository.listActiveSlugs().catch(() => []),
    cityRepository.listActiveSlugs().catch(() => []),
    featureFlags.guidesEnabled
      ? guideRepository.listPublished().catch(() => [])
      : Promise.resolve([]),
    featureFlags.blogEnabled
      ? blogPostRepository.listPublished().catch(() => [])
      : Promise.resolve([]),
  ]);

  const activeStaticPaths = staticPaths.filter((entry) => {
    if (entry.path === "/blog") {
      return featureFlags.blogEnabled;
    }

    if (entry.path === "/guides") {
      return featureFlags.guidesEnabled;
    }

    if (entry.path === "/reviews") {
      return featureFlags.reviewsEnabled;
    }

    return true;
  });

  const staticEntries: MetadataRoute.Sitemap = activeStaticPaths.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: new Date(),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  const serviceEntries: MetadataRoute.Sitemap = services.map((service) => ({
    url: absoluteUrl(`/services/${service.slug}`),
    lastModified: service.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const regionEntries: MetadataRoute.Sitemap = regions.map((region) => ({
    url: absoluteUrl(`/regions/${region.slug}`),
    lastModified: region.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const cityEntries: MetadataRoute.Sitemap = cities.map((city) => ({
    url: absoluteUrl(`/regions/${city.regionSlug}/${city.citySlug}`),
    lastModified: city.updatedAt,
    changeFrequency: "weekly",
    priority: 0.65,
  }));

  const guideEntries: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: absoluteUrl(`/guides/${guide.slug}`),
    lastModified: guide.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...serviceEntries,
    ...regionEntries,
    ...cityEntries,
    ...guideEntries,
    ...blogEntries,
  ];
}
