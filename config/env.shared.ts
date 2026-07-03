export const PRODUCTION_SITE_ORIGIN = "https://pakexcise.com" as const;
export const STAGING_SITE_ORIGIN = "https://staging.pakexcise.com" as const;
export const DEVELOPMENT_SITE_ORIGIN = "http://localhost:3000" as const;

export const APP_ENV_VALUES = ["development", "staging", "production"] as const;
export type AppEnv = (typeof APP_ENV_VALUES)[number];

export function normalizeOrigin(url: string): string {
  return url.replace(/\/$/, "");
}

export function getPublicAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configured) {
    return normalizeOrigin(configured);
  }

  if (process.env.APP_ENV === "production") {
    return PRODUCTION_SITE_ORIGIN;
  }

  if (process.env.APP_ENV === "staging") {
    return STAGING_SITE_ORIGIN;
  }

  return DEVELOPMENT_SITE_ORIGIN;
}
