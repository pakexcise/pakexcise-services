"use client";

import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { siteConfig } from "@/config/site";
import { setLocaleCookie } from "@/features/i18n/actions/set-locale";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

const localeLabels: Record<Locale, string> = {
  en: "EN",
  ur: "اردو",
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");
  const [targetLocale, setTargetLocale] = useState<Locale | null>(null);

  const isSwitching = targetLocale !== null && locale !== targetLocale;

  useEffect(() => {
    if (!isSwitching) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setTargetLocale(null);
    }, 12_000);

    return () => window.clearTimeout(timeout);
  }, [isSwitching, targetLocale]);

  async function handleSelect(nextLocale: Locale) {
    if (nextLocale === locale || isSwitching) {
      return;
    }

    setTargetLocale(nextLocale);

    try {
      await setLocaleCookie(nextLocale);
      router.replace(pathname, { locale: nextLocale });
    } catch {
      setTargetLocale(null);
    }
  }

  return (
    <div
      className="relative inline-flex items-center"
      role="group"
      aria-label={t("language")}
      aria-busy={isSwitching}
    >
      <div className="inline-flex rounded-lg border bg-muted/40 p-0.5">
        {siteConfig.locales.map((option) => {
          const isActive = locale === option;
          const isTarget = targetLocale === option && locale !== targetLocale;

          return (
            <button
              key={option}
              type="button"
              disabled={isSwitching}
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
              isTarget && !isActive && "text-foreground/80",
                option === "ur" && "font-[family-name:var(--font-urdu)]",
              )}
            >
              {localeLabels[option]}
            </button>
          );
        })}
      </div>

      {isSwitching ? (
        <Loader2
          className="text-primary ms-1 size-3.5 shrink-0 animate-spin"
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
