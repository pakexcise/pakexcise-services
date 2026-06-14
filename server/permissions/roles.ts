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
  "region:manage",
  "faq:manage",
  "social:manage",
  "payment-method:manage",
  "content:manage",
  "platform:manage",
  "users:manage",
  "settings:manage",
  "audit:read",
  "agents:manage",
] as const;

export type Permission = (typeof permissions)[number];

/** Always included for ADMIN — operational access only. */
export const baseAdminPermissions: Permission[] = [
  "application:read",
  "application:write",
  "application:status",
  "application:notes",
  "documents:read",
  "documents:verify",
  "payment:verify",
  "invoice:manage",
  "payment-method:manage",
  "agents:manage",
  "audit:read",
];

/** Permissions Super Admin can assign to individual Admin users. */
export const grantableAdminPermissions: Permission[] = [
  "service:manage",
  "region:manage",
  "faq:manage",
  "social:manage",
  "content:manage",
  "platform:manage",
  "settings:manage",
];

/** Reserved for Super Admin only — never grantable to Admin. */
export const superAdminOnlyPermissions: Permission[] = ["users:manage"];

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
  ADMIN: baseAdminPermissions,
  SUPER_ADMIN: permissions,
};

export function getPermissionsForRole(role: UserRole): readonly Permission[] {
  return rolePermissions[role];
}

export function isValidPermission(value: string): value is Permission {
  return (permissions as readonly string[]).includes(value);
}

export function hasPermissionInSet(
  permissionSet: readonly Permission[],
  permission: Permission,
): boolean {
  return permissionSet.includes(permission);
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

export type PermissionGroupKey =
  | "operations"
  | "catalog"
  | "content"
  | "platform"
  | "system";

export const permissionGroups: Record<
  PermissionGroupKey,
  { labelKey: string; permissions: Permission[] }
> = {
  operations: {
    labelKey: "operations",
    permissions: [...baseAdminPermissions],
  },
  catalog: {
    labelKey: "catalog",
    permissions: ["service:manage", "region:manage", "faq:manage", "social:manage"],
  },
  content: {
    labelKey: "content",
    permissions: ["content:manage"],
  },
  platform: {
    labelKey: "platform",
    permissions: ["platform:manage"],
  },
  system: {
    labelKey: "system",
    permissions: ["settings:manage"],
  },
};
