import "server-only";

import type { Route } from "next";
import { permanentRedirect, redirect } from "next/navigation";

import {
  buildPathRedirectMap,
  writePathRedirectMap,
} from "@/features/redirects/lib/path-redirect-cache";
import {
  destinationFromRedirectTarget,
  isPathRedirectKey,
  normalizeRedirectKey,
} from "@/features/redirects/lib/path-redirect-keys";
import { redirectRepository } from "@/server/repositories/redirect-repository";
import { prisma } from "@/server/db/client";

export {
  destinationFromRedirectTarget,
  isPathRedirectKey,
  normalizeRedirectKey,
} from "@/features/redirects/lib/path-redirect-keys";

/**
 * Resolve a browser pathname (e.g. `/faqs`) against admin path redirects.
 * Service/blog slug redirects continue to be handled by their page loaders.
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

/** Refresh the Edge-readable path-redirect map used by `proxy.ts`. */
export async function syncPathRedirectCache(): Promise<number> {
  const rows = await prisma.redirect.findMany({
    where: { isActive: true },
    select: {
      oldSlug: true,
      newSlug: true,
      statusCode: true,
    },
  });

  const map = buildPathRedirectMap(rows);
  await writePathRedirectMap(map);
  return Object.keys(map).length;
}

/**
 * @deprecated Prefer proxy-level redirects via `syncPathRedirectCache`.
 * Kept for any remaining callers; no longer used by marketing layout.
 */
export async function applyMarketingPathRedirect(
  pathname: string | null | undefined,
): Promise<void> {
  const trimmed = pathname?.trim();

  if (!trimmed || !trimmed.startsWith("/")) {
    return;
  }

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
    redirect(match.destination as Route);
  }

  permanentRedirect(match.destination as Route);
}
