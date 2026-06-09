"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { LOCALE_COOKIE_NAME } from "@/i18n/config";
import { localeCookieSchema } from "@/lib/validations/route-params";
import { parseInput } from "@/lib/validations/common";
import { getRequestMeta } from "@/server/auth/session";
import {
  enforceRateLimit,
  publicFormRateLimit,
} from "@/server/security/rate-limit";

export async function setLocaleCookie(input: unknown): Promise<void> {
  const parsed = parseInput(localeCookieSchema, input);

  if (!parsed.success) {
    throw new Error("Invalid locale");
  }

  const meta = await getRequestMeta();
  await enforceRateLimit(
    publicFormRateLimit,
    `locale:${meta.ipAddress ?? "anonymous"}`,
  );

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, parsed.data, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}
