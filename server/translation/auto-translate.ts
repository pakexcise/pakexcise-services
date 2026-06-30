import "server-only";

import { cache } from "react";

import type { Locale } from "@/i18n/config";
import type { LocalizedField } from "@/lib/i18n/content";
import { getEnglishSource } from "@/lib/i18n/content";

import { isAutoTranslateEnabled } from "./config";
import { translateEnglishText, translateEnglishTexts } from "./google-translate-client";

export function shouldAutoTranslate(locale: Locale | string): boolean {
  return locale === "ur" && isAutoTranslateEnabled();
}

export const autoTranslateText = cache(
  async (locale: Locale | string, text: string): Promise<string> => {
    if (!shouldAutoTranslate(locale)) {
      return text;
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return text;
    }

    return translateEnglishText(trimmed, "ur");
  },
);

export async function autoTranslateTexts(
  locale: Locale | string,
  texts: string[],
): Promise<string[]> {
  if (!shouldAutoTranslate(locale)) {
    return texts;
  }

  return translateEnglishTexts(texts, "ur");
}

export async function pickLocalizedAsync<T extends string>(
  locale: Locale | string,
  field: LocalizedField<T>,
  fallback = "",
): Promise<T | string> {
  const englishSource = getEnglishSource(field, fallback);

  if (locale !== "ur") {
    const primary = field.en?.trim();
    if (primary) {
      return primary;
    }

    const secondary = field.ur?.trim();
    if (secondary) {
      return secondary;
    }

    return fallback;
  }

  if (!englishSource) {
    return fallback;
  }

  if (!shouldAutoTranslate(locale)) {
    return englishSource;
  }

  return autoTranslateText(locale, englishSource);
}

export async function pickLocalizedBatchAsync(
  locale: Locale | string,
  fields: LocalizedField<string>[],
  fallbacks: string[] = [],
): Promise<string[]> {
  if (locale !== "ur") {
    return fields.map((field, index) => {
      const primary = field.en?.trim();
      if (primary) {
        return primary;
      }

      const secondary = field.ur?.trim();
      if (secondary) {
        return secondary;
      }

      return fallbacks[index] ?? "";
    });
  }

  const sources = fields.map((field, index) =>
    getEnglishSource(field, fallbacks[index] ?? ""),
  );

  if (!shouldAutoTranslate(locale)) {
    return sources;
  }

  const uniqueSources = [...new Set(sources.filter((value) => value.trim().length > 0))];
  const translatedList = await autoTranslateTexts(locale, uniqueSources);
  const translationMap = new Map(
    uniqueSources.map((source, index) => [source, translatedList[index] ?? source]),
  );

  return sources.map((source) => translationMap.get(source) ?? source);
}
