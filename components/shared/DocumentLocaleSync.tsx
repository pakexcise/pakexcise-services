"use client";

import { useLocale } from "next-intl";
import { useLayoutEffect } from "react";

import type { Locale } from "@/i18n/config";
import { applyDocumentLocale } from "@/lib/i18n/document-locale";

export function DocumentLocaleSync() {
  const locale = useLocale() as Locale;

  useLayoutEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  return null;
}
