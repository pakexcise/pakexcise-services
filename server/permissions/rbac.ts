import "server-only";

import type { UserRole } from "@prisma/client";

import type { CurrentUser } from "@/server/auth/current-user";
import {
  assertApplicationOwnership,
  canAccessApplication,
  getAuthContext,
  requireAdminPortal,
  requireApprovedAgent,
  requireCustomerPortal,
  requirePermission,
  requireRole,
  requireUser,
} from "@/server/permissions/guards";

export type AuthContext = {
  user: CurrentUser | null;
};

export {
  assertApplicationOwnership,
  canAccessApplication,
  getAuthContext,
  requireAdminPortal,
  requireApprovedAgent,
  requireCustomerPortal,
  requirePermission,
  requireRole,
  requireUser,
  type CurrentUser,
};

/**
 * @deprecated Use requireRole() or portal-specific guards instead.
 */
export async function requireAuth(
  minimumRole: UserRole = "CUSTOMER",
): Promise<AuthContext & { user: CurrentUser }> {
  const user = await requireUser();

  const roleOrder: Record<UserRole, number> = {
    CUSTOMER: 1,
    AGENT: 2,
    SUPPORT: 3,
    ADMIN: 4,
    SUPER_ADMIN: 5,
  };

  const userRole: UserRole = user.role;

  if (roleOrder[userRole] < roleOrder[minimumRole]) {
    throw new Error("FORBIDDEN");
  }

  return { user };
}
