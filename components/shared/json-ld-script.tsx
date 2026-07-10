type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

/**
 * Server-only JSON-LD helper for use inside <head> in a Server Component layout.
 * Do not render inside Client Components or page bodies wrapped by providers.
 */
export function serializeJsonLd(data: JsonLdData): string {
  // Prevent </script> in FAQ/content from breaking the HTML script tag.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
