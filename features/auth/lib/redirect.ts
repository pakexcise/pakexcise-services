import type { UserRole } from "@prisma/client";

export const AUTH_REDIRECT_PATH = "/auth/redirect";

const defaultDashboardByRole: Record<UserRole, string> = {
  CUSTOMER: "/customer/dashboard",
  AGENT: "/agent/dashboard",
  SUPPORT: "/admin/applications",
  ADMIN: "/admin/dashboard",
  SUPER_ADMIN: "/admin/dashboard",
};

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

  return defaultDashboardByRole[role] ?? "/customer/dashboard";
}

export function buildAuthRedirectUrl(callbackUrl?: string | null): string {
  if (!isSafeInternalPath(callbackUrl)) {
    return AUTH_REDIRECT_PATH;
  }

  const params = new URLSearchParams({ callbackUrl });
  return `${AUTH_REDIRECT_PATH}?${params.toString()}`;
}
