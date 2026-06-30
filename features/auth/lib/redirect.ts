import type { UserRole } from "@prisma/client";

import { getDashboardPathByRole } from "@/features/auth/lib/get-dashboard-path-by-role";

export const AUTH_REDIRECT_PATH = "/auth/redirect";

const staffRoles = new Set<UserRole>(["ADMIN", "SUPER_ADMIN", "SUPPORT"]);

export function isSafeInternalPath(path: string | null | undefined): path is string {
  if (!path) {
    return false;
  }

  if (!path.startsWith("/") || path.startsWith("//")) {
    return false;
  }

  if (path.startsWith("/api/")) {
    return false;
  }

  return true;
}

export function resolvePostLoginPath(
  role: UserRole,
  callbackUrl?: string | null,
): string {
  if (isSafeInternalPath(callbackUrl)) {
    return callbackUrl;
  }

  return getDashboardPathByRole(role);
}

export function buildAuthRedirectUrl(callbackUrl?: string | null): string {
  if (!isSafeInternalPath(callbackUrl)) {
    return AUTH_REDIRECT_PATH;
  }

  const params = new URLSearchParams({ callbackUrl });
  return `${AUTH_REDIRECT_PATH}?${params.toString()}`;
}

export function needsRoleChoice(user: {
  role: UserRole;
  roleChosenAt: Date | null;
}): boolean {
  if (user.roleChosenAt) {
    return false;
  }

  return !staffRoles.has(user.role);
}
