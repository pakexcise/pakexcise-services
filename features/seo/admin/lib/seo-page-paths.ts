import "server-only";

/** Best-effort public path from SeoMeta.pageKey for cache revalidation. */
export function publicPathFromSeoPageKey(pageKey: string): string | null {
  if (pageKey === "home") return "/";

  if (pageKey.startsWith("service:")) {
    const rest = pageKey.slice("service:".length);
    const parts = rest.split(":");
    if (parts.length === 2 && parts[0] && parts[1]) {
      return `/services/${parts[0]}/${parts[1]}`;
    }
    return `/services/${rest}`;
  }
  if (pageKey.startsWith("region:")) {
    return `/regions/${pageKey.slice("region:".length)}`;
  }
  if (pageKey.startsWith("city:")) {
    const rest = pageKey.slice("city:".length);
    const [regionSlug, citySlug] = rest.split(":");
    if (regionSlug && citySlug) {
      return `/regions/${regionSlug}/${citySlug}`;
    }
  }
  if (pageKey.startsWith("blog:")) {
    return `/blog/${pageKey.slice("blog:".length)}`;
  }
  if (pageKey.startsWith("legal:")) {
    const slug = pageKey.slice("legal:".length);
    const legalMap: Record<string, string> = {
      "privacy-policy": "/privacy",
      "terms-and-conditions": "/terms",
      disclaimer: "/disclaimer",
      "refund-policy": "/refund",
      "payment-policy": "/payment-policy",
      "cookie-policy": "/cookie-policy",
    };
    return legalMap[slug] ?? `/${slug}`;
  }
  if (pageKey.startsWith("page:")) {
    return `/${pageKey.slice("page:".length)}`;
  }

  if (!pageKey.includes(":")) {
    return `/${pageKey}`;
  }

  return null;
}
