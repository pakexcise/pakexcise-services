export const SETTINGS_KEYS = {
  business: "settings:business",
  publicUi: "settings:public-ui",
  forms: "settings:forms",
  branding: "settings:branding",
  payment: "settings:payment",
  seo: "settings:seo",
  tracking: "settings:tracking",
  features: "settings:features",
} as const;

export type SettingsGroupKey = keyof typeof SETTINGS_KEYS;

export const PUBLIC_SETTINGS_CACHE_TAG = "public-settings";
