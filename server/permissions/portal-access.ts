import "server-only";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { buildLoginRedirectUrl } from "@/config/auth";
import { resolvePostLoginPath } from "@/features/auth/lib/redirect";
import { isAuthError } from "@/lib/errors/auth-errors";
import {
  getCurrentUser,
  type CurrentUser,
} from "@/server/auth/current-user";

export async function enforcePortalAccess(
  loader: () => Promise<CurrentUser>,
  callbackPath: string,
): Promise<CurrentUser> {
  try {
    return await loader();
  } catch (error) {
    if (isAuthError(error)) {
      if (error.code === "UNAUTHORIZED" || error.code === "ACCOUNT_DISABLED") {
        redirect(buildLoginRedirectUrl(callbackPath) as Route);
      }

      if (error.code === "FORBIDDEN" || error.code === "AGENT_NOT_APPROVED") {
        const user = await getCurrentUser();

        if (user) {
          redirect(resolvePostLoginPath(user.role) as Route);
        }
      }
    }

    throw error;
  }
}
