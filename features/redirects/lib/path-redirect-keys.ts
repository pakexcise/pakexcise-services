/** Content keys stay prefixed; page paths get a leading slash and no trailing slash. */
export function normalizeRedirectKey(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return trimmed;
  }

  if (trimmed.startsWith("blog:")) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    if (trimmed.length > 1 && trimmed.endsWith("/")) {
      return trimmed.replace(/\/+$/, "") || "/";
    }

    return trimmed;
  }

  return trimmed;
}

export function isPathRedirectKey(value: string): boolean {
  return normalizeRedirectKey(value).startsWith("/");
}

export function destinationFromRedirectTarget(target: string): string {
  const normalized = normalizeRedirectKey(target);

  if (normalized.startsWith("blog:")) {
    return `/blog/${normalized.slice("blog:".length)}`;
  }

  if (normalized.startsWith("/")) {
    return normalized;
  }

  // Bare service slug stored as path redirect target.
  return `/services/${normalized}`;
}
