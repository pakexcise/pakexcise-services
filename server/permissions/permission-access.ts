import "server-only";

import type { Permission } from "@/server/permissions/roles";
import { enforcePortalAccess } from "@/server/permissions/portal-access";
import { requirePermission } from "@/server/permissions/guards";
import type { CurrentUser } from "@/server/auth/current-user";

export function enforcePermissionAccess(permission: Permission) {
  return (): Promise<CurrentUser> =>
    enforcePortalAccess(
      () => requirePermission(permission),
      "/admin/dashboard",
    );
}
