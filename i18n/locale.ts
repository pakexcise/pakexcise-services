import { appConfig } from "@/config/app";
import { routing, type Locale } from "@/i18n/config";

export type { Locale };

export function isValidLocale(value: string): value is Locale {
  return appConfig.locales.includes(value as Locale);
}

export function resolveLocaleFromCookie(
  cookieValue: string | undefined,
): Locale {
  if (cookieValue && isValidLocale(cookieValue)) {
    return cookieValue;
  }

  return routing.defaultLocale;
}
