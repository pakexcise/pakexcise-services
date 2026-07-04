"use server";

import { revalidatePath } from "next/cache";

import { generateTrackingId } from "@/features/applications/lib/tracking-id";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { formatFirstFieldError } from "@/lib/validations/format-field-errors";
import {
  adminCreateApplicationSchema,
  adminUpdateApplicationSchema,
  deleteApplicationSchema,
} from "@/lib/validations/admin-application";
import { auditAdminAction } from "@/server/admin/audit-action";
import { applicationRepository } from "@/server/repositories/application-repository";
import { prisma } from "@/server/db/client";
import { queueApplicationStatusNotifications } from "@/server/notifications/queue-application-status-notification";
import { emitApplicationChange } from "@/server/realtime/application-events";
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
    return errorResult(
      formatFirstFieldError(parsed.fieldErrors),
      parsed.fieldErrors,
    );
  }

  const data = parsed.data;
  const relationError = await validateApplicationRelations(data);

  if (relationError) {
    let fieldErrors: Record<string, string[]> | undefined;

    if (relationError === "Customer not found.") {
      fieldErrors = { userId: ["Selected customer was not found."] };
    } else if (relationError === "Service not found.") {
      fieldErrors = { serviceId: ["Selected service was not found."] };
    } else if (relationError === "Agent not found.") {
      fieldErrors = { agentId: ["Selected agent was not found."] };
    }

    return errorResult(relationError, fieldErrors);
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
    return errorResult(
      formatFirstFieldError(parsed.fieldErrors),
      parsed.fieldErrors,
    );
  }

  const existing = await applicationRepository.findAdminById(parsed.data.id);

  if (!existing) {
    return errorResult("Application not found.");
  }

  const data = parsed.data;
  const resolvedUserId = data.userId ?? existing.user.id;
  const resolvedServiceId = data.serviceId ?? existing.service.id;
  const resolvedAgentId =
    data.agentId !== undefined
      ? data.agentId
      : (existing.agent?.id ?? null);
  const resolvedLocale =
    data.locale ?? (existing.locale === "ur" ? "ur" : "en");

  const assignmentChanged =
    (data.userId !== undefined && data.userId !== existing.user.id) ||
    (data.serviceId !== undefined && data.serviceId !== existing.service.id) ||
    (data.agentId !== undefined &&
      (data.agentId ?? null) !== (existing.agent?.id ?? null));

  if (assignmentChanged) {
    const relationError = await validateApplicationRelations({
      userId: resolvedUserId,
      serviceId: resolvedServiceId,
      agentId: resolvedAgentId,
    });

    if (relationError) {
      let fieldErrors: Record<string, string[]> | undefined;

      if (relationError === "Customer not found.") {
        fieldErrors = { userId: ["Selected customer was not found."] };
      } else if (relationError === "Service not found.") {
        fieldErrors = { serviceId: ["Selected service was not found."] };
      } else if (relationError === "Agent not found.") {
        fieldErrors = { agentId: ["Selected agent was not found."] };
      }

      return errorResult(relationError, fieldErrors);
    }
  }

  const statusChanged = existing.status !== data.status;
  const statusChangeNote = data.statusChangeNote?.trim() ?? "";

  if (statusChanged && statusChangeNote.length < 3) {
    return errorResult("A status change note is required when changing status.", {
      statusChangeNote: ["A status change note is required when changing status."],
    });
  }

  const updated = await applicationRepository.updateAdmin({
    id: data.id,
    userId: resolvedUserId,
    serviceId: resolvedServiceId,
    agentId: resolvedAgentId,
    locale: resolvedLocale,
    status: data.status,
    adminNotes: data.adminNotes?.trim() || null,
    statusChangeNote: statusChanged ? statusChangeNote : undefined,
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
      userId: resolvedUserId,
      serviceId: resolvedServiceId,
    },
  });

  if (statusChanged) {
    const customer = await prisma.user.findUnique({
      where: { id: resolvedUserId },
      select: { email: true, phone: true },
    });

    await queueApplicationStatusNotifications({
      applicationId: updated.id,
      userId: resolvedUserId,
      trackingId: updated.trackingId,
      serviceName: existing.service.nameEn,
      serviceNameUr: existing.service.nameUr,
      locale: resolvedLocale,
      toStatus: updated.status,
      note: statusChangeNote,
      userEmail: customer?.email ?? "",
      userPhone: customer?.phone,
    });

    await emitApplicationChange({
      applicationId: updated.id,
      userId: resolvedUserId,
      agentId: resolvedAgentId,
      trackingId: updated.trackingId,
      locale: resolvedLocale,
      status: updated.status,
      changeType: "status",
      notificationPayload: {
        serviceName: existing.service.nameEn,
        serviceNameUr: existing.service.nameUr,
        note: statusChangeNote,
        fromStatus: existing.status,
        toStatus: updated.status,
      },
    });
  }

  revalidateApplicationPaths(updated.id);

  return successResult({ id: updated.id });
}

export async function deleteApplicationAdminAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const actor = await requireSuperAdmin();
  const parsed = parseInput(deleteApplicationSchema, input);

  if (!parsed.success) {
    return errorResult(
      formatFirstFieldError(parsed.fieldErrors),
      parsed.fieldErrors,
    );
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
