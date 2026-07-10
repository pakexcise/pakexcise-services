/**
 * Recommended DB redirects for legacy service slugs only.
 * Legal (/privacy, /terms, /refund) and region aliases live in next.config.ts — do not duplicate here.
 * Blog/guide redirects use `blog:` / `guide:` prefixes and are created automatically when slugs change.
 */
export const RECOMMENDED_SERVICE_REDIRECTS = [
  { oldSlug: "token-tax-all-provinces", newSlug: "token-tax-payment" },
  { oldSlug: "token-tax", newSlug: "token-tax-payment" },
  { oldSlug: "vehicle-transfer-punjab", newSlug: "vehicle-transfer" },
  { oldSlug: "vehicle-transfer-islamabad-ict", newSlug: "vehicle-transfer" },
  {
    oldSlug: "new-vehicle-registration-punjab",
    newSlug: "new-vehicle-registration",
  },
  {
    oldSlug: "new-vehicle-registration-islamabad-ict",
    newSlug: "new-vehicle-registration",
  },
  { oldSlug: "vehicle-inspection", newSlug: "vehicle-passing-fitness" },
  { oldSlug: "vehicle-inspection-punjab", newSlug: "vehicle-passing-fitness" },
  {
    oldSlug: "vehicle-inspection-islamabad-ict",
    newSlug: "vehicle-passing-fitness",
  },
  {
    oldSlug: "vehicle-passing-fitness-islamabad-ict",
    newSlug: "vehicle-passing-fitness",
  },
  { oldSlug: "route-permit-punjab", newSlug: "route-permit" },
  { oldSlug: "route-permit-islamabad-ict", newSlug: "route-permit" },
  { oldSlug: "data-correction-punjab-ict", newSlug: "vehicle-data-correction" },
  {
    oldSlug: "data-correction-islamabad-ict",
    newSlug: "vehicle-data-correction",
  },
  {
    oldSlug: "driving-license-renewal-punjab",
    newSlug: "driving-license-renewal",
  },
  {
    oldSlug: "driving-license-renewal-punjab-ict",
    newSlug: "driving-license-renewal",
  },
  { oldSlug: "learner-license-punjab-ict", newSlug: "learner-license" },
] as const;

export const LEGACY_SERVICE_SLUGS_TO_DEACTIVATE = [
  ...new Set(RECOMMENDED_SERVICE_REDIRECTS.map((item) => item.oldSlug)),
] as const;
