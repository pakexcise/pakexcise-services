import "server-only";

import type { Application, UserRole } from "@prisma/client";

import { buildLoginRedirectUrl } from "@/config/auth";
import { AuthError } from "@/lib/errors/auth-errors";
import { isAdminRoleRequiringTwoFactor } from "@/server/auth/config";
import {
  type CurrentUser,
  getCurrentUser,
  requireUser as requireAuthenticatedUser,
} from "@/server/auth/current-user";
import {
  type Permission,
  portalRoles,
  roleHasPermission,
} from "@/server/permissions/roles";
import { prisma } from "@/server/db/client";

export type { CurrentUser };

export async function requireUser(): Promise<CurrentUser> {
  return requireAuthenticatedUser();
}

export async function requireRole(
  ...allowedRoles: readonly UserRole[]
): Promise<CurrentUser> {
  const user = await requireUser();

  if (!allowedRoles.includes(user.role)) {
    throw new AuthError("FORBIDDEN", "Insufficient role for this action");
  }

  return user;
}

export async function requirePermission(
  permission: Permission,
): Promise<CurrentUser> {
  const user = await requireUser();

  if (!roleHasPermission(user.role, permission)) {
    throw new AuthError("FORBIDDEN", "Missing required permission");
  }

  return user;
}

export async function requireCustomerPortal(): Promise<CurrentUser> {
  return requireRole(...portalRoles.customer);
}

export async function requireApplyAccess(): Promise<CurrentUser> {
  const user = await requireUser();

  if (user.role === "CUSTOMER") {
    return user;
  }

  if (user.role === "AGENT") {
    return requireApprovedAgent();
  }

  throw new AuthError("FORBIDDEN", "Only customers and approved agents can apply");
}

export async function requireAgent(): Promise<CurrentUser> {
  return requireRole(...portalRoles.agent);
}

export async function requireApprovedAgent(): Promise<CurrentUser> {
  const user = await requireRole(...portalRoles.agent);

  if (
    !user.agentProfile ||
    user.agentProfile.approvalStatus !== "APPROVED" ||
    !user.agentProfile.isActive
  ) {
    throw new AuthError("AGENT_NOT_APPROVED", "Agent account is not approved");
  }

  return user;
}

export async function requireAdminPortal(): Promise<CurrentUser> {
  const user = await requireRole(...portalRoles.admin);
  return assertAdminTwoFactor(user);
}

export function assertAdminTwoFactor(user: CurrentUser): CurrentUser {
  if (!isAdminRoleRequiringTwoFactor(user.role)) {
    return user;
  }

  if (!user.twoFactorEnabled) {
    return user;
  }

  if (!user.sessionTwoFactorVerifiedAt) {
    throw new AuthError(
      "TWO_FACTOR_REQUIRED",
      "Two-factor authentication verification required",
    );
  }

  return user;
}

export async function assertApplicationOwnership(
  applicationId: string,
): Promise<{ user: CurrentUser; application: Application }> {
  const user = await requireUser();

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new AuthError("FORBIDDEN", "Application not found or access denied");
  }

  if (canAccessApplication(user, application)) {
    return { user, application };
  }

  throw new AuthError("FORBIDDEN", "Application access denied");
}

export function canAccessApplication(
  user: CurrentUser,
  application: Pick<Application, "userId" | "agentId">,
): boolean {
  if (user.role === "AGENT") {
    return (
      application.agentId === user.id &&
      user.agentProfile?.approvalStatus === "APPROVED" &&
      user.agentProfile.isActive
    );
  }

  if (user.role === "CUSTOMER") {
    return application.userId === user.id;
  }

  if (roleHasPermission(user.role, "application:read")) {
    return true;
  }

  return false;
}

export async function getAuthContext(): Promise<{
  user: CurrentUser | null;
}> {
  const user = await getCurrentUser();

  if (!user || user.status !== "ACTIVE") {
    return { user: null };
  }

  return { user };
}

export { buildLoginRedirectUrl };
