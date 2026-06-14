import "server-only";

import { cache } from "react";
import type { UserRole } from "@prisma/client";

import { adminPermissionRepository } from "@/server/repositories/admin-permission-repository";
import {
  baseAdminPermissions,
  getPermissionsForRole,
  grantableAdminPermissions,
  hasPermissionInSet,
  isValidPermission,
  permissions,
  type Permission,
} from "@/server/permissions/roles";

export async function resolveEffectivePermissions(
  userId: string,
  role: UserRole,
): Promise<Permission[]> {
  if (role === "SUPER_ADMIN") {
    return [...permissions];
  }

  const roleDefaults = [...getPermissionsForRole(role)];

  if (role !== "ADMIN") {
    return roleDefaults;
  }

  const grants = await adminPermissionRepository.listForUser(userId);
  const grantPermissions = grants.filter(isValidPermission);

  return [...new Set([...roleDefaults, ...grantPermissions])];
}

export const getCachedEffectivePermissions = cache(
  async (userId: string, role: UserRole): Promise<Permission[]> => {
    return resolveEffectivePermissions(userId, role);
  },
);

export async function userHasPermission(
  userId: string,
  role: UserRole,
  permission: Permission,
): Promise<boolean> {
  const effective = await getCachedEffectivePermissions(userId, role);
  return hasPermissionInSet(effective, permission);
}

export function filterGrantablePermissions(
  input: readonly string[],
): Permission[] {
  const allowed = new Set<string>(grantableAdminPermissions);
  return input.filter(
    (value): value is Permission =>
      isValidPermission(value) && allowed.has(value),
  );
}

export function getBaseAdminPermissionSet(): Permission[] {
  return [...baseAdminPermissions];
}
