"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { appConfig } from "@/config/app";
import { LOCALE_COOKIE_NAME, type Locale } from "@/i18n/config";

export async function setLocaleCookie(locale: Locale): Promise<void> {
  if (!appConfig.locales.includes(locale)) {
    throw new Error("Invalid locale");
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}
