import type { Locale } from "@/i18n/config";

export type LocalizedField<T = string> = {
  en: T | null | undefined;
  ur: T | null | undefined;
};

function asLocalizedText(value: unknown): string {
  if (value == null) {
    return "";
  }

  return String(value);
}

export function pickLocalized<T extends string>(
  locale: Locale | string,
  field: LocalizedField<T>,
  fallback = "",
): T | string {
  const isUrdu = locale === "ur";
  const primary = asLocalizedText(isUrdu ? field.ur : field.en);
  const secondary = asLocalizedText(isUrdu ? field.en : field.ur);

  if (primary.trim().length > 0) {
    return primary;
  }

  if (secondary.trim().length > 0) {
    return secondary;
  }

  return fallback;
}
