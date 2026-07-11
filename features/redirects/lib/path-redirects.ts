import "server-only";

import { permanentRedirect, redirect } from "next/navigation";

import { redirectRepository } from "@/server/repositories/redirect-repository";

/** Content keys stay prefixed; page paths get a leading slash and no trailing slash. */
export function normalizeRedirectKey(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return trimmed;
  }

  if (trimmed.startsWith("blog:") || trimmed.startsWith("guide:")) {
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

function destinationFromRedirectTarget(target: string): string {
  const normalized = normalizeRedirectKey(target);

  if (normalized.startsWith("blog:")) {
    return `/blog/${normalized.slice("blog:".length)}`;
  }

  if (normalized.startsWith("guide:")) {
    return `/guides/${normalized.slice("guide:".length)}`;
  }

  if (normalized.startsWith("/")) {
    return normalized;
  }

  // Bare service slug stored as path redirect target.
  return `/services/${normalized}`;
}

/**
 * Resolve a browser pathname (e.g. `/faqs`) against admin path redirects.
 * Service/blog/guide slug redirects continue to be handled by their page loaders.
 */
export async function resolveActivePathRedirect(pathname: string): Promise<{
  destination: string;
  statusCode: number;
} | null> {
  const normalizedPath = normalizeRedirectKey(pathname);

  if (!normalizedPath.startsWith("/")) {
    return null;
  }

  const candidates = Array.from(
    new Set([
      normalizedPath,
      normalizedPath === "/" ? "/" : normalizedPath.replace(/^\//, ""),
    ]),
  );

  for (const oldSlug of candidates) {
    const match = await redirectRepository.findActiveByOldSlug(oldSlug);

    if (!match) {
      continue;
    }

    const destination = destinationFromRedirectTarget(match.newSlug);

    if (!destination || destination === normalizedPath) {
      continue;
    }

    return {
      destination,
      statusCode: match.statusCode === 302 ? 302 : 301,
    };
  }

  return null;
}

export async function applyMarketingPathRedirect(
  pathname: string | null | undefined,
): Promise<void> {
  const trimmed = pathname?.trim();

  if (!trimmed || !trimmed.startsWith("/")) {
    return;
  }

  // Private areas are never redirected from marketing chrome.
  if (
    trimmed.startsWith("/admin") ||
    trimmed.startsWith("/customer") ||
    trimmed.startsWith("/agent") ||
    trimmed.startsWith("/support") ||
    trimmed.startsWith("/api") ||
    trimmed.startsWith("/login") ||
    trimmed.startsWith("/signup") ||
    trimmed.startsWith("/auth")
  ) {
    return;
  }

  const match = await resolveActivePathRedirect(trimmed);

  if (!match) {
    return;
  }

  if (match.statusCode === 302) {
    redirect(match.destination);
  }

  permanentRedirect(match.destination);
}
