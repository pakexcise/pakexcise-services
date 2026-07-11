/**
 * Built-in permanent URL aliases for PakExcise.
 * Applied in next.config.ts — never stored in the admin Redirects table.
 *
 * Admin DB redirects are only for:
 * - manual custom rules
 * - automatic rules when an admin renames a service / blog / guide slug
 */
export const LEGACY_SERVICE_SLUG_REDIRECTS = [
  { from: "token-tax-all-provinces", to: "token-tax-payment" },
  { from: "token-tax", to: "token-tax-payment" },
  { from: "vehicle-transfer-punjab", to: "vehicle-transfer" },
  { from: "vehicle-transfer-islamabad-ict", to: "vehicle-transfer" },
  {
    from: "new-vehicle-registration-punjab",
    to: "new-vehicle-registration",
  },
  {
    from: "new-vehicle-registration-islamabad-ict",
    to: "new-vehicle-registration",
  },
  { from: "vehicle-inspection", to: "vehicle-passing-fitness" },
  { from: "vehicle-inspection-punjab", to: "vehicle-passing-fitness" },
  {
    from: "vehicle-inspection-islamabad-ict",
    to: "vehicle-passing-fitness",
  },
  {
    from: "vehicle-passing-fitness-islamabad-ict",
    to: "vehicle-passing-fitness",
  },
  { from: "route-permit-punjab", to: "route-permit" },
  { from: "route-permit-islamabad-ict", to: "route-permit" },
  { from: "data-correction-punjab-ict", to: "vehicle-data-correction" },
  {
    from: "data-correction-islamabad-ict",
    to: "vehicle-data-correction",
  },
  {
    from: "driving-license-renewal-punjab",
    to: "driving-license-renewal",
  },
  {
    from: "driving-license-renewal-punjab-ict",
    to: "driving-license-renewal",
  },
  { from: "learner-license-punjab-ict", to: "learner-license" },
] as const;

export const LEGACY_SERVICE_SLUGS_TO_DEACTIVATE = [
  ...new Set(LEGACY_SERVICE_SLUG_REDIRECTS.map((item) => item.from)),
] as const;

const SERVICE_PATH_PREFIXES = ["/services", "/apply", "/request"] as const;

export type NextConfigRedirect = {
  source: string;
  destination: string;
  permanent: boolean;
};

/** Expand legacy service slugs into Next.js permanent redirects for all public service paths. */
export function buildLegacyServiceNextRedirects(): NextConfigRedirect[] {
  return LEGACY_SERVICE_SLUG_REDIRECTS.flatMap(({ from, to }) =>
    SERVICE_PATH_PREFIXES.map((prefix) => ({
      source: `${prefix}/${from}`,
      destination: `${prefix}/${to}`,
      permanent: true,
    })),
  );
}
