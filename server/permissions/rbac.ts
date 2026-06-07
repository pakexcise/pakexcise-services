import "server-only";

import { headers } from "next/headers";

import type { UserRole } from "@/config/app";
import { roleHierarchy } from "@/config/app";
import { auth, type AuthUser } from "@/server/auth";

export type AuthContext = {
  user: AuthUser | null;
  role: UserRole | "GUEST";
};

export async function getAuthContext(): Promise<AuthContext> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { user: null, role: "GUEST" };
  }

  const role = normalizeRole(session.user.role);

  return {
    user: session.user,
    role,
  };
}

export function normalizeRole(role: string | null | undefined): UserRole {
  if (role && role in roleHierarchy && role !== "GUEST") {
    return role as UserRole;
  }

  return "CUSTOMER";
}

export function hasMinimumRole(
  currentRole: UserRole | "GUEST",
  requiredRole: UserRole,
): boolean {
  return roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
}

export async function requireAuth(minimumRole: UserRole = "CUSTOMER"): Promise<AuthContext & { user: AuthUser }> {
  const context = await getAuthContext();

  if (!context.user) {
    throw new Error("UNAUTHORIZED");
  }

  if (!hasMinimumRole(context.role, minimumRole)) {
    throw new Error("FORBIDDEN");
  }

  return { ...context, user: context.user };
}

export function canAccessApplication(
  context: AuthContext,
  application: { userId: string; agentId: string | null },
): boolean {
  if (!context.user) {
    return false;
  }

  if (hasMinimumRole(context.role, "SUPPORT")) {
    return true;
  }

  if (context.role === "AGENT") {
    return application.agentId === context.user.id;
  }

  return application.userId === context.user.id;
}
