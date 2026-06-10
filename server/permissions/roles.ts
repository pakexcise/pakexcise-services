import type { UserRole } from "@prisma/client";

export const permissions = [
  "application:read",
  "application:write",
  "application:status",
  "application:notes",
  "documents:read",
  "documents:verify",
  "payment:verify",
  "invoice:manage",
  "service:manage",
  "faq:manage",
  "social:manage",
  "content:manage",
  "users:manage",
  "settings:manage",
  "audit:read",
  "agents:manage",
] as const;

export type Permission = (typeof permissions)[number];

const adminPermissions: Permission[] = [
  "application:read",
  "application:write",
  "application:status",
  "application:notes",
  "documents:read",
  "documents:verify",
  "payment:verify",
  "invoice:manage",
  "service:manage",
  "faq:manage",
  "social:manage",
  "content:manage",
  "agents:manage",
  "audit:read",
];

const supportPermissions: Permission[] = [
  "application:read",
  "application:notes",
  "documents:read",
];

const agentPermissions: Permission[] = ["application:write"];

export const rolePermissions: Record<UserRole, readonly Permission[]> = {
  CUSTOMER: [],
  AGENT: agentPermissions,
  SUPPORT: supportPermissions,
  ADMIN: adminPermissions,
  SUPER_ADMIN: permissions,
};

export function getPermissionsForRole(role: UserRole): readonly Permission[] {
  return rolePermissions[role];
}

export function roleHasPermission(
  role: UserRole,
  permission: Permission,
): boolean {
  return getPermissionsForRole(role).includes(permission);
}

export const portalRoles = {
  customer: ["CUSTOMER"] as const satisfies readonly UserRole[],
  agent: ["AGENT"] as const satisfies readonly UserRole[],
  support: ["SUPPORT"] as const satisfies readonly UserRole[],
  admin: ["ADMIN", "SUPER_ADMIN"] as const satisfies readonly UserRole[],
};
