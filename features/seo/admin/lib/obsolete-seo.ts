import "server-only";

import type { Prisma } from "@prisma/client";

/** Removed CMS (Guides). Leftover SEO rows 404 and should not appear in admin. */
export const OBSOLETE_SEO_PAGE_KEY_PREFIXES = ["guide:"] as const;

export function obsoleteSeoPageKeyWhere(): Prisma.SeoMetaWhereInput {
  return {
    OR: OBSOLETE_SEO_PAGE_KEY_PREFIXES.map((prefix) => ({
      pageKey: { startsWith: prefix },
    })),
  };
}

export function activeSeoMetaWhere(
  extra: Prisma.SeoMetaWhereInput = {},
): Prisma.SeoMetaWhereInput {
  return {
    AND: [
      {
        NOT: obsoleteSeoPageKeyWhere(),
      },
      extra,
    ],
  };
}
