"use server";

import { headers } from "next/headers";

import { canImpersonateTarget } from "@/features/admin/impersonation/lib/can-impersonate-target";
import { impersonateUserSchema } from "@/features/admin/impersonation/validators";
import { getDashboardPathByRole } from "@/features/auth/lib/dashboard-path";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { auth } from "@/server/auth/config";
import { getCurrentUser } from "@/server/auth/current-user";
import { markSessionTwoFactorVerified } from "@/server/auth/session";
import { prisma } from "@/server/db/client";
import { requireSuperAdmin } from "@/server/permissions/guards";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

export async function startImpersonationAction(
  input: unknown,
): Promise<ActionResult<{ redirectTo: string }>> {
  const actor = await requireSuperAdmin();
  await enforceRateLimit(
    serverActionRateLimit,
    `impersonation-start:${actor.id}`,
  );

  if (actor.isImpersonating) {
    return errorResult("Exit the current impersonation session first.");
  }

  const parsed = parseInput(impersonateUserSchema, input);
  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const target = await prisma.user.findFirst({
    where: {
      id: parsed.data.userId,
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
    },
  });

  if (!target) {
    return errorResult("User not found.");
  }

  const allowed = canImpersonateTarget({
    actorId: actor.id,
    actorRole: actor.role,
    targetId: target.id,
    targetRole: target.role,
    targetStatus: target.status,
  });

  if (!allowed.ok) {
    return errorResult(allowed.reason);
  }

  try {
    await auth.api.impersonateUser({
      body: { userId: target.id },
      headers: await headers(),
    });
  } catch (error) {
    console.error("[impersonation] start failed", error);
    return errorResult("Unable to start impersonation. Please try again.");
  }

  if (target.role === "ADMIN") {
    const impersonationSession = await prisma.session.findFirst({
      where: {
        userId: target.id,
        impersonatedBy: actor.id,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (impersonationSession) {
      await markSessionTwoFactorVerified(impersonationSession.id);
    }
  }

  await auditAdminAction({
    actorId: actor.id,
    action: "LOGIN",
    entityType: "impersonation",
    entityId: target.id,
    after: {
      targetRole: target.role,
      targetEmail: target.email,
      targetName: target.name,
    },
  });

  return successResult({
    redirectTo: getDashboardPathByRole(target.role),
  });
}

export async function stopImpersonationAction(): Promise<
  ActionResult<{ redirectTo: string }>
> {
  const current = await getCurrentUser();

  if (!current?.isImpersonating || !current.impersonatedBy) {
    return errorResult("You are not impersonating anyone.");
  }

  const realActorId = current.impersonatedBy;
  const targetSnapshot = {
    targetId: current.id,
    targetRole: current.role,
    targetEmail: current.email,
  };

  try {
    await auth.api.stopImpersonating({
      headers: await headers(),
    });
  } catch (error) {
    console.error("[impersonation] stop failed", error);
    return errorResult("Unable to exit impersonation. Please try again.");
  }

  await auditAdminAction({
    actorId: realActorId,
    action: "LOGOUT",
    entityType: "impersonation",
    entityId: targetSnapshot.targetId,
    after: targetSnapshot,
  });

  return successResult({
    redirectTo: "/admin/dashboard",
  });
}
