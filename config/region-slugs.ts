/** Legacy region slugs kept for redirects after canonical slug migration. */
export const LEGACY_REGION_SLUGS = [
  "islamabad-ict",
  "khyber-pakhtunkhwa",
  "azad-kashmir",
] as const;

export const REGION_SLUG_ALIASES: Record<string, string> = {
  "islamabad-ict": "islamabad",
  "khyber-pakhtunkhwa": "kpk",
  "azad-kashmir": "ajk",
};

export function resolveCanonicalRegionSlug(slug: string): string {
  return REGION_SLUG_ALIASES[slug] ?? slug;
}

export const CANONICAL_PROVINCE_SLUGS = [
  "punjab",
  "sindh",
  "kpk",
  "balochistan",
  "islamabad",
  "gilgit-baltistan",
  "ajk",
] as const;
