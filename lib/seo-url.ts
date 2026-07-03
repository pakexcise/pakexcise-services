import "server-only";

import { PRODUCTION_SITE_ORIGIN } from "@/config/env.shared";
import { shouldAllowSearchIndexing } from "@/config/env.server";
import { publicPath } from "@/lib/utils";

const BLOCKED_SEO_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "staging.pakexcise.com",
]);

function normalizeSeoPath(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath === "/" ? "" : normalizedPath;
}

export function seoAbsoluteUrl(path: string): string {
  return `${PRODUCTION_SITE_ORIGIN}${normalizeSeoPath(path)}`;
}

export function sanitizeSeoUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (BLOCKED_SEO_HOSTS.has(parsed.hostname.toLowerCase())) {
      return `${PRODUCTION_SITE_ORIGIN}${normalizeSeoPath(parsed.pathname)}${parsed.search}${parsed.hash}`;
    }

    return `${PRODUCTION_SITE_ORIGIN}${normalizeSeoPath(parsed.pathname)}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function resolveSeoCanonicalUrl(input: {
  path: string;
  canonical?: string | null;
}): string | undefined {
  if (!shouldAllowSearchIndexing()) {
    return undefined;
  }

  if (input.canonical) {
    const sanitized = sanitizeSeoUrl(input.canonical);
    if (sanitized) {
      return sanitized;
    }
  }

  return seoAbsoluteUrl(publicPath(input.path));
}

export function resolveSeoImageUrl(image: string | null | undefined): string | undefined {
  if (!shouldAllowSearchIndexing() || !image) {
    return undefined;
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return sanitizeSeoUrl(image) ?? undefined;
  }

  return seoAbsoluteUrl(image.startsWith("/") ? image : `/${image}`);
}
