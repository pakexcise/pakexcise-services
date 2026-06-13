"use client";

import { usePathname } from "next/navigation";

/**
 * Locale-aware routes use `localePrefix: "never"`, so the pathname from
 * Next.js matches the localized app path without requiring next-intl context.
 */
export function useAppPathname(): string {
  return usePathname();
}
