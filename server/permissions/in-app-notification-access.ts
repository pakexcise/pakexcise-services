import "server-only";

import type { UserRole } from "@prisma/client";

const IN_APP_NOTIFICATION_ROLES = new Set<UserRole>([
  "CUSTOMER",
  "AGENT",
  "ADMIN",
  "SUPER_ADMIN",
]);

export function canAccessInAppNotifications(role: UserRole): boolean {
  return IN_APP_NOTIFICATION_ROLES.has(role);
}
