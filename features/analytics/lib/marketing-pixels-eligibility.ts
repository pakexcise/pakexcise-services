import type { UserRole } from "@prisma/client";

/** Internal roles excluded from GA4/GTM on public pages (testing must not pollute reports). */
const STAFF_ANALYTICS_EXCLUDED_ROLES: ReadonlySet<UserRole> = new Set([
  "SUPER_ADMIN",
  "ADMIN",
  "SUPPORT",
  "AGENT",
]);

export type MarketingPixelsUserContext = {
  role: UserRole;
  impersonatedBy?: string | null;
};

export function shouldExcludeUserFromMarketingPixels(
  user: MarketingPixelsUserContext | null | undefined,
): boolean {
  if (!user) {
    return false;
  }

  if (user.impersonatedBy) {
    return true;
  }

  return STAFF_ANALYTICS_EXCLUDED_ROLES.has(user.role);
}
