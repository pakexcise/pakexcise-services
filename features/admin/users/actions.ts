"use server";

import { revalidatePath } from "next/cache";

import {
  adminStaffIdSchema,
  createAdminStaffSchema,
  resetAdminStaffPasswordSchema,
  updateAdminStaffSchema,
} from "@/features/admin/users/validators";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import { adminPermissionRepository } from "@/server/repositories/admin-permission-repository";
import { adminStaffRepository } from "@/server/repositories/admin-staff-repository";
import { filterGrantablePermissions } from "@/server/permissions/effective-permissions";
import { requirePermission } from "@/server/permissions/guards";
import { hashPassword } from "@/server/security/hash";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

const ADMIN_USERS_PATH = "/admin/users";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function createAdminStaffAction(
  input: unknown,
): Promise<ActionResult<{ userId: string }>> {
  const actor = await requirePermission("users:manage");
  await enforceRateLimit(serverActionRateLimit, `admin-user-create:${actor.id}`);

  const parsed = parseInput(createAdminStaffSchema, input);
  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const data = parsed.data;
  const email = normalizeEmail(data.email);
  const permissions = filterGrantablePermissions(data.permissions);

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    return errorResult("A user with this email already exists");
  }

  const passwordHash = await hashPassword(data.password);

  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: data.name,
        email,
        emailVerified: true,
        role: data.role,
        status: "ACTIVE",
        roleChosenAt: new Date(),
        accounts: {
          create: {
            providerId: "credential",
            accountId: email,
            password: passwordHash,
          },
        },
      },
      select: { id: true, role: true },
    });

    if (user.role === "ADMIN" && permissions.length > 0) {
      await tx.adminPermissionGrant.createMany({
        data: permissions.map((permission) => ({
          userId: user.id,
          permission,
          grantedBy: actor.id,
        })),
      });
    }

    return user;
  });

  await auditAdminAction({
    actorId: actor.id,
    action: "CREATE",
    entityType: "admin_user",
    entityId: created.id,
    after: {
      role: created.role,
      permissions,
    },
  });

  revalidatePath(ADMIN_USERS_PATH);
  return successResult({ userId: created.id });
}

export async function updateAdminStaffAction(
  input: unknown,
): Promise<ActionResult<{ userId: string }>> {
  const actor = await requirePermission("users:manage");
  await enforceRateLimit(serverActionRateLimit, `admin-user-update:${actor.id}`);

  const parsed = parseInput(updateAdminStaffSchema, input);
  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const data = parsed.data;
  const target = await adminStaffRepository.findStaffById(data.userId);

  if (!target) {
    return errorResult("Staff user not found");
  }

  if (target.role === "SUPER_ADMIN") {
    return errorResult("Super admin accounts cannot be edited here");
  }

  if (target.role === "ADMIN") {
    const permissions = filterGrantablePermissions(data.permissions);
    await adminPermissionRepository.replaceForUser({
      userId: target.id,
      permissions,
      grantedBy: actor.id,
    });

    await prisma.user.update({
      where: { id: target.id },
      data: {
        name: data.name,
        status: data.status,
      },
    });

    await auditAdminAction({
      actorId: actor.id,
      action: "UPDATE",
      entityType: "admin_user",
      entityId: target.id,
      after: {
        status: data.status,
        permissions,
      },
    });
  } else {
    await prisma.user.update({
      where: { id: target.id },
      data: {
        name: data.name,
        status: data.status,
      },
    });

    await auditAdminAction({
      actorId: actor.id,
      action: "UPDATE",
      entityType: "admin_user",
      entityId: target.id,
      after: { status: data.status },
    });
  }

  revalidatePath(ADMIN_USERS_PATH);
  revalidatePath(`${ADMIN_USERS_PATH}/${target.id}/edit`);
  return successResult({ userId: target.id });
}

export async function resetAdminStaffPasswordAction(
  input: unknown,
): Promise<ActionResult<{ userId: string }>> {
  const actor = await requirePermission("users:manage");
  await enforceRateLimit(serverActionRateLimit, `admin-user-reset:${actor.id}`);

  const parsed = parseInput(resetAdminStaffPasswordSchema, input);
  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const target = await adminStaffRepository.findStaffById(parsed.data.userId);
  if (!target || target.role === "SUPER_ADMIN") {
    return errorResult("Staff user not found");
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const account = await prisma.account.findFirst({
    where: {
      userId: target.id,
      providerId: "credential",
    },
    select: { id: true },
  });

  if (!account) {
    return errorResult("Credential login is not configured for this user");
  }

  await prisma.account.update({
    where: { id: account.id },
    data: { password: passwordHash },
  });

  await auditAdminAction({
    actorId: actor.id,
    action: "UPDATE",
    entityType: "admin_user_password",
    entityId: target.id,
  });

  return successResult({ userId: target.id });
}

export async function disableAdminStaffAction(
  input: unknown,
): Promise<ActionResult<{ userId: string }>> {
  const actor = await requirePermission("users:manage");
  const parsed = parseInput(adminStaffIdSchema, input);
  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const target = await adminStaffRepository.findStaffById(parsed.data.userId);
  if (!target || target.role === "SUPER_ADMIN") {
    return errorResult("Staff user not found");
  }

  if (target.id === actor.id) {
    return errorResult("You cannot disable your own account");
  }

  await prisma.user.update({
    where: { id: target.id },
    data: { status: "DISABLED" },
  });

  await auditAdminAction({
    actorId: actor.id,
    action: "UPDATE",
    entityType: "admin_user",
    entityId: target.id,
    after: { status: "DISABLED" },
  });

  revalidatePath(ADMIN_USERS_PATH);
  return successResult({ userId: target.id });
}
