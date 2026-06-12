import { resolveCanonicalRegionSlug } from "@/config/region-slugs";

export function getCanonicalRegionSlug(slug: string): string {
  return resolveCanonicalRegionSlug(slug);
}

export function isLegacyRegionSlug(slug: string): boolean {
  return resolveCanonicalRegionSlug(slug) !== slug;
}
