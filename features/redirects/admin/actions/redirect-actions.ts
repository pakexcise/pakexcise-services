"use server";

import { revalidatePath } from "next/cache";

import {
  createRedirectSchema,
  redirectIdSchema,
  toggleRedirectSchema,
  updateRedirectSchema,
} from "@/lib/validations/admin-redirect";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import { adminRedirectRepository } from "@/server/repositories/admin-redirect-repository";
import { requirePermission } from "@/server/permissions/guards";

const ADMIN_PATH = "/admin/redirects";

function redirectSnapshot(redirect: {
  id: string;
  oldSlug: string;
  newSlug: string;
  statusCode: number;
  isActive: boolean;
}) {
  return {
    id: redirect.id,
    oldSlug: redirect.oldSlug,
    newSlug: redirect.newSlug,
    statusCode: redirect.statusCode,
    isActive: redirect.isActive,
  };
}

function revalidateRedirectPaths() {
  revalidatePath(ADMIN_PATH);
  revalidatePath("/services");
  revalidatePath("/blog");
  revalidatePath("/guides");
}

export async function createRedirectAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("platform:manage");
  const parsed = parseInput(createRedirectSchema, input);
  if (!parsed.success) return parsed;

  const data = parsed.data;
  const existing = await prisma.redirect.findUnique({
    where: { oldSlug: data.oldSlug },
  });
  if (existing) {
    return errorResult("Old slug already has a redirect", {
      oldSlug: ["Redirect exists"],
    });
  }

  const redirect = await prisma.redirect.create({ data });

  await auditAdminAction({
    actorId: user.id,
    action: "CREATE",
    entityType: "redirect",
    entityId: redirect.id,
    after: redirectSnapshot(redirect),
  });

  revalidateRedirectPaths();
  return successResult({ id: redirect.id });
}

export async function updateRedirectAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("platform:manage");
  const parsed = parseInput(updateRedirectSchema, input);
  if (!parsed.success) return parsed;

  const data = parsed.data;
  const existing = await adminRedirectRepository.findById(data.id);
  if (!existing) return errorResult("Redirect not found");

  if (data.oldSlug !== existing.oldSlug) {
    const conflict = await prisma.redirect.findUnique({
      where: { oldSlug: data.oldSlug },
    });
    if (conflict) {
      return errorResult("Old slug already has a redirect", {
        oldSlug: ["Redirect exists"],
      });
    }
  }

  const redirect = await prisma.redirect.update({
    where: { id: data.id },
    data,
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "redirect",
    entityId: redirect.id,
    before: redirectSnapshot(existing),
    after: redirectSnapshot(redirect),
  });

  revalidateRedirectPaths();
  return successResult({ id: redirect.id });
}

export async function toggleRedirectAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("platform:manage");
  const parsed = parseInput(toggleRedirectSchema, input);
  if (!parsed.success) return parsed;

  const existing = await adminRedirectRepository.findById(parsed.data.id);
  if (!existing) return errorResult("Redirect not found");

  const redirect = await prisma.redirect.update({
    where: { id: parsed.data.id },
    data: { isActive: parsed.data.isActive },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "STATUS_CHANGE",
    entityType: "redirect",
    entityId: redirect.id,
    before: { isActive: existing.isActive },
    after: { isActive: redirect.isActive },
  });

  revalidateRedirectPaths();
  return successResult({ id: redirect.id });
}

export async function deleteRedirectAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("platform:manage");
  const parsed = parseInput(redirectIdSchema, input);
  if (!parsed.success) return parsed;

  const existing = await adminRedirectRepository.findById(parsed.data.id);
  if (!existing) return errorResult("Redirect not found");

  await prisma.redirect.delete({ where: { id: parsed.data.id } });

  await auditAdminAction({
    actorId: user.id,
    action: "DELETE",
    entityType: "redirect",
    entityId: existing.id,
    before: redirectSnapshot(existing),
  });

  revalidateRedirectPaths();
  return successResult({ id: existing.id });
}
