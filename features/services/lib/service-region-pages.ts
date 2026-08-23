import type { Route } from "next";

import { resolveCanonicalRegionSlug } from "@/config/region-slugs";

export type ServiceRegionPageRef = {
  serviceSlug: string;
  regionSlug: string;
};

export function buildServiceRegionPageKey(
  serviceSlug: string,
  regionSlug: string,
): string {
  return `service:${serviceSlug}:${resolveCanonicalRegionSlug(regionSlug)}`;
}

export function buildServiceRegionPath(
  serviceSlug: string,
  regionSlug: string,
): Route {
  return `/services/${serviceSlug}/${resolveCanonicalRegionSlug(regionSlug)}` as Route;
}

export function parseServiceRegionPageKey(
  pageKey: string,
): ServiceRegionPageRef | null {
  if (!pageKey.startsWith("service:")) {
    return null;
  }

  const parts = pageKey.slice("service:".length).split(":");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return null;
  }

  return {
    serviceSlug: parts[0],
    regionSlug: resolveCanonicalRegionSlug(parts[1]),
  };
}

export function isServiceRegionPageKey(pageKey: string): boolean {
  return parseServiceRegionPageKey(pageKey) !== null;
}

export function buildDefaultServiceRegionSeo(input: {
  serviceName: string;
  serviceShortDescription: string | null;
  regionName: string;
}): {
  metaTitleEn: string;
  metaDescriptionEn: string;
  h1En: string;
} {
  const serviceName = input.serviceName.trim();
  const regionName = input.regionName.trim();
  const title = `${serviceName} in ${regionName} | PakExcise.com`;
  const h1 = `${serviceName} in ${regionName}`;
  const description =
    input.serviceShortDescription?.trim() ||
    `Private facilitation support for ${serviceName} in ${regionName}. PakExcise.com is not a government website.`;

  return {
    metaTitleEn: title,
    metaDescriptionEn: description,
    h1En: h1,
  };
}
