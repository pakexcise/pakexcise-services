import "server-only";

import type { CurrentUser } from "@/server/auth/current-user";
import { canAccessApplication } from "@/server/permissions/guards";
import { roleHasPermission } from "@/server/permissions/roles";

export function canViewInvoicePdf(
  user: CurrentUser,
  application: { userId: string; agentId: string | null },
): boolean {
  if (roleHasPermission(user.role, "invoice:manage")) {
    return true;
  }

  return canAccessApplication(user, application);
}
