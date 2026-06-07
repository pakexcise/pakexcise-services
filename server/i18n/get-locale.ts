import "server-only";

import { cookies } from "next/headers";

import { LOCALE_COOKIE_NAME } from "@/i18n/config";
import { resolveLocaleFromCookie, type Locale } from "@/i18n/locale";

export type { Locale };

export { isValidLocale } from "@/i18n/locale";

export async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  return resolveLocaleFromCookie(cookieLocale);
}
