import type { UserRole } from "@prisma/client";

const dashboardPathByRole = {
  CUSTOMER: "/customer/dashboard",
  AGENT: "/agent/dashboard",
  SUPPORT: "/support/dashboard",
  ADMIN: "/admin/dashboard",
  SUPER_ADMIN: "/admin/dashboard",
} as const satisfies Record<UserRole, string>;

export function getDashboardPathByRole(role: UserRole): string {
  return dashboardPathByRole[role] ?? dashboardPathByRole.CUSTOMER;
}
