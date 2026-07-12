import type { Route } from "next";
import { redirect } from "next/navigation";

import { buildLoginRedirectUrl } from "@/config/auth";
import { buildChooseRoleUrl } from "@/features/auth/lib/auth-url";
import {
  buildAuthRedirectUrl,
  needsRoleChoice,
  resolvePostLoginPath,
} from "@/features/auth/lib/redirect";
import { getCurrentUser } from "@/server/auth/current-user";

type AuthRedirectPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function AuthRedirectPage({
  searchParams,
}: AuthRedirectPageProps) {
  const { callbackUrl } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect(
      buildLoginRedirectUrl(buildAuthRedirectUrl(callbackUrl)) as Route,
    );
  }

  if (needsRoleChoice(user)) {
    redirect(buildChooseRoleUrl({ callbackUrl }) as Route);
  }

  redirect(resolvePostLoginPath(user.role, callbackUrl) as Route);
}
