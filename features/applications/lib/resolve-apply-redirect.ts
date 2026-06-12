import { appendSearchParams, buildLoginUrl } from "@/features/auth/lib/auth-url";
import { resolvePostLoginPath } from "@/features/auth/lib/redirect";
import type { CurrentUser } from "@/server/auth/current-user";
import type { ApplyAccessResult } from "@/server/permissions/apply-access";

export function getApplyUser(access: ApplyAccessResult): CurrentUser | null {
  return access.allowed ? access.user : null;
}

export function resolveApplyRedirectHref(
  access: ApplyAccessResult,
  callbackPath: string,
): string {
  if (access.allowed) {
    return callbackPath;
  }

  if (access.reason === "UNAUTHORIZED") {
    return buildLoginUrl({ callbackUrl: callbackPath });
  }

  if (access.reason === "AGENT_NOT_APPROVED") {
    return appendSearchParams("/agent/dashboard", { apply: "pending" });
  }

  return appendSearchParams(resolvePostLoginPath(access.user.role), {
    apply: "unavailable",
  });
}
