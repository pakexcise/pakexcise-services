import type { Locale } from "@/i18n/config";

export function applyDocumentLocale(locale: Locale): void {
  if (typeof document === "undefined") {
    return;
  }

  const direction = locale === "ur" ? "rtl" : "ltr";
  const root = document.documentElement;

  root.lang = locale;
  root.dir = direction;
  root.dataset.locale = locale;
  delete root.dataset.localeSwitching;

  const body = document.body;

  if (body) {
    body.dataset.locale = locale;
    body.classList.toggle("font-urdu", locale === "ur");
  }

  const contentLanguageMeta = document.querySelector(
    'meta[http-equiv="Content-Language"]',
  );

  contentLanguageMeta?.setAttribute("content", locale);
}
