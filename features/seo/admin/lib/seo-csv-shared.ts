export const SEO_CSV_HEADERS = [
  "id",
  "updated_at",
  "name",
  "slug",
  "path",
  "h1",
  "meta_title",
  "meta_description",
  "focused_keywords",
  "og_title",
  "og_description",
  "canonical_url",
  "robots",
] as const;

export type SeoCsvHeader = (typeof SEO_CSV_HEADERS)[number];

export type SeoCsvCategory =
  | "static"
  | "services"
  | "cities"
  | "regions"
  | "blog"
  | "legal"
  | "all";

export type SeoCsvRow = Record<SeoCsvHeader, string>;

export function formatRobotsCsv(
  robotsIndex: boolean,
  robotsFollow: boolean,
): string {
  return `${robotsIndex ? "index" : "noindex"},${robotsFollow ? "follow" : "nofollow"}`;
}

export function parseRobotsCsv(value: string): {
  robotsIndex: boolean;
  robotsFollow: boolean;
} {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "");
  if (!normalized) {
    return { robotsIndex: true, robotsFollow: true };
  }

  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return { robotsIndex: true, robotsFollow: true };
  }
  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return { robotsIndex: false, robotsFollow: true };
  }

  const parts = normalized.split(/[|,/]/);
  const tokens = new Set(parts.filter(Boolean));

  return {
    robotsIndex: !tokens.has("noindex"),
    robotsFollow: !tokens.has("nofollow"),
  };
}

export function seoCsvFilename(category: SeoCsvCategory): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `pakexcise-seo-${category}-${stamp}.csv`;
}
