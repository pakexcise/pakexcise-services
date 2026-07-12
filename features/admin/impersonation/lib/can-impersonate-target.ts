import type { UserRole, UserStatus } from "@prisma/client";

const IMPERSONATABLE_ROLES = new Set<UserRole>([
  "CUSTOMER",
  "AGENT",
  "ADMIN",
]);

export function canImpersonateTarget(input: {
  actorId: string;
  actorRole: UserRole;
  targetId: string;
  targetRole: UserRole;
  targetStatus: UserStatus;
}): { ok: true } | { ok: false; reason: string } {
  if (input.actorRole !== "SUPER_ADMIN") {
    return { ok: false, reason: "Only Super Admin can impersonate users." };
  }

  if (input.targetId === input.actorId) {
    return { ok: false, reason: "You cannot impersonate your own account." };
  }

  if (input.targetStatus !== "ACTIVE") {
    return { ok: false, reason: "Only active users can be impersonated." };
  }

  if (!IMPERSONATABLE_ROLES.has(input.targetRole)) {
    return { ok: false, reason: "This user role cannot be impersonated." };
  }

  return { ok: true };
}
