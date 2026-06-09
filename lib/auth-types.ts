import type { UserRole } from "@prisma/client";

export type AuthSessionUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  role?: UserRole;
};

export function getUserRole(
  user: unknown,
  fallback: UserRole = "CUSTOMER",
): UserRole {
  if (!user || typeof user !== "object" || !("role" in user)) {
    return fallback;
  }

  const role = (user as { role?: unknown }).role;

  if (
    role === "CUSTOMER" ||
    role === "AGENT" ||
    role === "SUPPORT" ||
    role === "ADMIN" ||
    role === "SUPER_ADMIN"
  ) {
    return role;
  }

  return fallback;
}
