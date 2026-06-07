"use client";

import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

import { siteConfig } from "@/config/site";
import { setLocaleCookie } from "@/features/i18n/actions/set-locale";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  ur: "اردو",
};

function applyDocumentLocale(locale: Locale): void {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ur" ? "rtl" : "ltr";
  document.documentElement.dataset.locale = locale;
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const t = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  useEffect(() => {
    document.documentElement.dataset.localeSwitching = isPending
      ? "true"
      : "false";
  }, [isPending]);

  function handleSelect(nextLocale: Locale) {
    if (nextLocale === locale || isPending) {
      return;
    }

    startTransition(async () => {
      applyDocumentLocale(nextLocale);
      await setLocaleCookie(nextLocale);
      router.refresh();
    });
  }

  return (
    <div
      className="relative inline-flex items-center"
      role="group"
      aria-label={t("language")}
    >
      <div className="inline-flex rounded-lg border bg-muted/40 p-0.5">
        {siteConfig.locales.map((option) => {
          const isActive = locale === option;

          return (
            <button
              key={option}
              type="button"
              disabled={isPending}
              aria-pressed={isActive}
              aria-label={option === "en" ? t("english") : t("urdu")}
              onClick={() => handleSelect(option)}
              className={cn(
                "relative min-w-11 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-60",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
                option === "ur" && "font-[family-name:var(--font-urdu)]",
              )}
            >
              {localeLabels[option]}
            </button>
          );
        })}
      </div>

      {isPending ? (
        <Loader2
          className="text-primary absolute -end-6 size-3.5 animate-spin"
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
