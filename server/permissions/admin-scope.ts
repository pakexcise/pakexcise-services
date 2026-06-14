import "server-only";

import type { UserRole } from "@prisma/client";

/** Audit log actor roles hidden from standard Admin viewers. */
export const hiddenAuditActorRolesForAdmin = [
  "SUPER_ADMIN",
] as const satisfies readonly UserRole[];

/** Notification recipient roles visible to standard Admin viewers. */
export const adminVisibleNotificationRecipientRoles = [
  "CUSTOMER",
  "AGENT",
  "ADMIN",
] as const satisfies readonly UserRole[];

export function isSuperAdminRole(role: UserRole): boolean {
  return role === "SUPER_ADMIN";
}
