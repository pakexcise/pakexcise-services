import { defineRouting } from "next-intl/routing";

import { siteConfig } from "@/config/site";

export const locales = [...siteConfig.locales] as const;
export const defaultLocale = siteConfig.defaultLocale;
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export const routing = defineRouting({
  locales: [...siteConfig.locales],
  defaultLocale: siteConfig.defaultLocale,
  localePrefix: "never",
  localeDetection: true,
  localeCookie: {
    name: LOCALE_COOKIE_NAME,
    maxAge: 60 * 60 * 24 * 365,
  },
});

export type Locale = (typeof locales)[number];
