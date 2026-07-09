const HTML_TAG_PATTERN = /<[^>]+>/g;
const WHITESPACE_PATTERN = /\s+/g;

export function stripHtmlForJsonLd(value: string): string {
  return value
    .replace(HTML_TAG_PATTERN, " ")
    .replace(WHITESPACE_PATTERN, " ")
    .trim();
}

export function normalizeJsonLdText(
  value: string | null | undefined,
  maxLength = 5000,
): string {
  if (!value?.trim()) {
    return "";
  }

  const plain = stripHtmlForJsonLd(value);
  return plain.length > maxLength ? `${plain.slice(0, maxLength - 1)}…` : plain;
}

export type JsonLdContactPointInput = {
  contactType: string;
  telephone?: string;
  email?: string;
  url?: string;
  areaServed?: string;
  availableLanguage?: string[];
};

export function buildContactPointNodes(
  points: JsonLdContactPointInput[],
): Record<string, unknown>[] {
  return points
    .map((point) => {
      const payload: Record<string, unknown> = {
        "@type": "ContactPoint",
        contactType: point.contactType,
      };

      if (point.telephone) {
        payload.telephone = point.telephone;
      }

      if (point.email) {
        payload.email = point.email;
      }

      if (point.url) {
        payload.url = point.url;
      }

      if (point.areaServed) {
        payload.areaServed = point.areaServed;
      }

      if (point.availableLanguage?.length) {
        payload.availableLanguage = point.availableLanguage;
      }

      const hasChannel =
        Boolean(point.telephone) ||
        Boolean(point.email) ||
        Boolean(point.url);

      return hasChannel ? payload : null;
    })
    .filter((point): point is Record<string, unknown> => point !== null);
}

export function organizationId(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/#organization`;
}

export function websiteId(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, "")}/#website`;
}

export function dedupeSameAs(urls: string[]): string[] {
  const seen = new Set<string>();

  return urls
    .map((url) => url.trim())
    .filter((url) => {
      if (!url || seen.has(url)) {
        return false;
      }

      seen.add(url);
      return true;
    });
}
