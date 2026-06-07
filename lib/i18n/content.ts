import type { Locale } from "@/i18n/config";

export type LocalizedField<T = string> = {
  en: T | null | undefined;
  ur: T | null | undefined;
};

export function pickLocalized<T extends string>(
  locale: Locale | string,
  field: LocalizedField<T>,
  fallback = "",
): T | string {
  const isUrdu = locale === "ur";
  const primary = isUrdu ? field.ur : field.en;
  const secondary = isUrdu ? field.en : field.ur;

  if (primary && primary.trim().length > 0) {
    return primary;
  }

  if (secondary && secondary.trim().length > 0) {
    return secondary;
  }

  return fallback;
}
