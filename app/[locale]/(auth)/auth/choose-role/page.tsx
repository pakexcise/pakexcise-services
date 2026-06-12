import type { Route } from "next";
import { redirect } from "next/navigation";

import { buildChooseRoleUrl } from "@/features/auth/lib/auth-url";

type LegacyChooseRoleRedirectProps = {
  searchParams: Promise<{ callbackUrl?: string; intent?: string }>;
};

export default async function LegacyChooseRoleRedirectPage({
  searchParams,
}: LegacyChooseRoleRedirectProps) {
  const params = await searchParams;

  redirect(
    buildChooseRoleUrl({
      callbackUrl: params.callbackUrl,
      intent: params.intent === "agent" ? "agent" : undefined,
    }) as Route,
  );
}
