import type { UserRole } from "@prisma/client";

export const DASHBOARD_PATH_BY_ROLE = {
  CUSTOMER: "/customer/dashboard",
  AGENT: "/agent/dashboard",
  SUPPORT: "/support/dashboard",
  ADMIN: "/admin/dashboard",
  SUPER_ADMIN: "/admin/dashboard",
} as const satisfies Record<UserRole, string>;

export function getDashboardPathByRole(role: UserRole): string {
  return DASHBOARD_PATH_BY_ROLE[role] ?? DASHBOARD_PATH_BY_ROLE.CUSTOMER;
}

export function getApplicationsPathByRole(role: UserRole): string {
  switch (role) {
    case "CUSTOMER":
      return "/customer/dashboard";
    case "AGENT":
      return "/agent/applications";
    case "SUPPORT":
      return "/support/applications";
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin/applications";
    default:
      return getDashboardPathByRole(role);
  }
}

export function getProfilePathByRole(role: UserRole): string | null {
  switch (role) {
    case "CUSTOMER":
      return "/customer/profile";
    case "AGENT":
      return "/agent/profile";
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin/settings";
    default:
      return null;
  }
}

export function shouldShowApplicationsLink(role: UserRole): boolean {
  return role === "CUSTOMER" || role === "AGENT";
}
