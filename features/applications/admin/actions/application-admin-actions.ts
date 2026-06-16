"use server";

import { revalidatePath } from "next/cache";

import { generateTrackingId } from "@/features/applications/lib/tracking-id";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import {
  adminCreateApplicationSchema,
  adminUpdateApplicationSchema,
  deleteApplicationSchema,
} from "@/lib/validations/admin-application";
import { auditAdminAction } from "@/server/admin/audit-action";
import { applicationRepository } from "@/server/repositories/application-repository";
import { prisma } from "@/server/db/client";
import { requireSuperAdmin } from "@/server/permissions/guards";

function revalidateApplicationPaths(id?: string) {
  revalidatePath("/admin/applications");
  revalidatePath("/admin/dashboard");
  if (id) {
    revalidatePath(`/admin/applications/${id}`);
    revalidatePath(`/admin/applications/${id}/edit`);
  }
}

async function validateApplicationRelations(input: {
  userId: string;
  serviceId: string;
  agentId?: string | null;
}): Promise<string | null> {
  const [customer, service, agent] = await Promise.all([
    prisma.user.findFirst({
      where: {
        id: input.userId,
        role: "CUSTOMER",
        deletedAt: null,
      },
      select: { id: true },
    }),
    prisma.service.findFirst({
      where: {
        id: input.serviceId,
        deletedAt: null,
      },
      select: { id: true },
    }),
    input.agentId
      ? prisma.user.findFirst({
          where: {
            id: input.agentId,
            role: "AGENT",
            deletedAt: null,
          },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  if (!customer) {
    return "Customer not found.";
  }

  if (!service) {
    return "Service not found.";
  }

  if (input.agentId && !agent) {
    return "Agent not found.";
  }

  return null;
}

export async function createApplicationAdminAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const actor = await requireSuperAdmin();
  const parsed = parseInput(adminCreateApplicationSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const data = parsed.data;
  const relationError = await validateApplicationRelations(data);

  if (relationError) {
    return errorResult(relationError);
  }

  const application = await applicationRepository.createAdmin({
    trackingId: await generateTrackingId(),
    userId: data.userId,
    serviceId: data.serviceId,
    agentId: data.agentId ?? null,
    locale: data.locale,
    status: data.status,
    adminNotes: data.adminNotes?.trim() || null,
    statusChangeNote: data.statusChangeNote.trim(),
    actorId: actor.id,
  });

  await auditAdminAction({
    actorId: actor.id,
    action: "CREATE",
    entityType: "application",
    entityId: application.id,
    after: { trackingId: application.trackingId, status: data.status },
  });

  revalidateApplicationPaths(application.id);

  return successResult({ id: application.id });
}

export async function updateApplicationAdminAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const actor = await requireSuperAdmin();
  const parsed = parseInput(adminUpdateApplicationSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const existing = await applicationRepository.findAdminById(parsed.data.id);

  if (!existing) {
    return errorResult("Application not found.");
  }

  const data = parsed.data;
  const relationError = await validateApplicationRelations(data);

  if (relationError) {
    return errorResult(relationError);
  }

  if (existing.status !== data.status && !data.statusChangeNote.trim()) {
    return errorResult("A status change note is required when changing status.");
  }

  const updated = await applicationRepository.updateAdmin({
    id: data.id,
    userId: data.userId,
    serviceId: data.serviceId,
    agentId: data.agentId ?? null,
    locale: data.locale,
    status: data.status,
    adminNotes: data.adminNotes?.trim() || null,
    statusChangeNote: data.statusChangeNote.trim(),
    actorId: actor.id,
  });

  if (!updated) {
    return errorResult("Application not found.");
  }

  await auditAdminAction({
    actorId: actor.id,
    action: "UPDATE",
    entityType: "application",
    entityId: updated.id,
    before: {
      trackingId: existing.trackingId,
      status: existing.status,
      userId: existing.user.id,
      serviceId: existing.service.id,
    },
    after: {
      trackingId: updated.trackingId,
      status: updated.status,
      userId: data.userId,
      serviceId: data.serviceId,
    },
  });

  revalidateApplicationPaths(updated.id);

  return successResult({ id: updated.id });
}

export async function deleteApplicationAdminAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const actor = await requireSuperAdmin();
  const parsed = parseInput(deleteApplicationSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const existing = await applicationRepository.findAdminById(parsed.data.id);

  if (!existing) {
    return errorResult("Application not found.");
  }

  const deleted = await applicationRepository.deleteAdmin(parsed.data.id);

  if (!deleted) {
    return errorResult("Application not found.");
  }

  await auditAdminAction({
    actorId: actor.id,
    action: "DELETE",
    entityType: "application",
    entityId: parsed.data.id,
    before: { trackingId: existing.trackingId },
  });

  revalidateApplicationPaths();

  return successResult({ id: parsed.data.id });
}
