import "server-only";

import { enforcePortalAccess } from "@/server/permissions/portal-access";
import { requirePermission } from "@/server/permissions/guards";
import type { CurrentUser } from "@/server/auth/current-user";

export async function enforcePlatformManageAccess(): Promise<CurrentUser> {
  return enforcePortalAccess(
    () => requirePermission("platform:manage"),
    "/admin/dashboard",
  );
}
