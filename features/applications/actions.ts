"use server";

import { z } from "zod";

import { hasUploadedCompletionProof } from "@/features/applications/lib/completion-proof";
import { COMPLETION_PROOF_DOC_TYPE } from "@/config/uploads";
import {
  canTransitionApplicationStatus,
  getAllowedNextStatuses,
  shouldNotifyCustomerOnTransition,
} from "@/features/applications/status-machine";
import {
  bulkAssignApplicationsSchema,
  confirmCompletionProofSchema,
  transitionApplicationStatusSchema,
  updateAdminNotesSchema,
  uploadCompletionProofSchema,
} from "@/features/applications/validators";
import { handleConfirmUpload, handlePresignUpload } from "@/features/documents/lib/handlers";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { emitApplicationChange } from "@/server/realtime/application-events";
import { prisma } from "@/server/db/client";
import { queueApplicationStatusNotifications } from "@/server/notifications/queue-application-status-notification";
import { applicationIdParamSchema } from "@/lib/validations/route-params";
import { requirePermission } from "@/server/permissions/guards";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

async function requireApplicationStatusPermission() {
  return requirePermission("application:status");
}

async function requireApplicationWritePermission() {
  return requirePermission("application:write");
}


export async function getAllowedStatusTransitionsAction(
  input: unknown,
): Promise<ActionResult<{ currentStatus: string; allowed: string[] }>> {
  await requireApplicationStatusPermission();

  const parsed = parseInput(
    z.object({ applicationId: applicationIdParamSchema }),
    input,
  );

  if (!parsed.success) {
    return parsed;
  }

  const application = await prisma.application.findUnique({
    where: { id: parsed.data.applicationId },
    select: { status: true },
  });

  if (!application) {
    return errorResult("Application not found");
  }

  return successResult({
    currentStatus: application.status,
    allowed: getAllowedNextStatuses(application.status),
  });
}

export async function transitionApplicationStatusAction(
  input: unknown,
): Promise<ActionResult<{ applicationId: string; status: string }>> {
  const user = await requireApplicationStatusPermission();
  await enforceRateLimit(serverActionRateLimit, `status:${user.id}`);

  const parsed = parseInput(transitionApplicationStatusSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const application = await prisma.application.findUnique({
    where: { id: parsed.data.applicationId },
    include: {
      service: { select: { requiresProof: true, nameEn: true, nameUr: true } },
      user: { select: { id: true, email: true, phone: true } },
    },
  });

  if (!application) {
    return errorResult("Application not found");
  }

  if (
    !canTransitionApplicationStatus(application.status, parsed.data.toStatus)
  ) {
    return errorResult("Invalid status transition");
  }

  if (parsed.data.toStatus === "COMPLETED" && application.service.requiresProof) {
    const hasProof = await hasUploadedCompletionProof(application.id);

    if (!hasProof) {
      return errorResult(
        "Completion proof must be uploaded before marking as completed",
      );
    }
  }

  const fromStatus = application.status;

  await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: application.id },
      data: { status: parsed.data.toStatus },
    });

    await tx.statusHistory.create({
      data: {
        applicationId: application.id,
        fromStatus,
        toStatus: parsed.data.toStatus,
        note: parsed.data.note,
        actorId: user.id,
      },
    });
  });

  await auditAdminAction({
    actorId: user.id,
    action: "STATUS_CHANGE",
    entityType: "application",
    entityId: application.id,
    before: { status: fromStatus },
    after: {
      status: parsed.data.toStatus,
      note: parsed.data.note,
    },
  });

  if (shouldNotifyCustomerOnTransition(parsed.data.toStatus)) {
    await queueApplicationStatusNotifications({
      applicationId: application.id,
      userId: application.user.id,
      trackingId: application.trackingId,
      serviceName: application.service.nameEn,
      serviceNameUr: application.service.nameUr,
      locale: application.locale,
      toStatus: parsed.data.toStatus,
      note: parsed.data.note,
      userEmail: application.user.email,
      userPhone: application.user.phone,
    });
  }

  await emitApplicationChange({
    applicationId: application.id,
    userId: application.userId,
    agentId: application.agentId,
    status: parsed.data.toStatus,
    changeType: "status",
  });

  return successResult({
    applicationId: application.id,
    status: parsed.data.toStatus,
  });
}

export async function updateAdminNotesAction(
  input: unknown,
): Promise<ActionResult<{ applicationId: string }>> {
  const user = await requirePermission("application:notes");
  const parsed = parseInput(updateAdminNotesSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const existing = await prisma.application.findUnique({
    where: { id: parsed.data.applicationId },
    select: { id: true, adminNotes: true },
  });

  if (!existing) {
    return errorResult("Application not found");
  }

  await prisma.application.update({
    where: { id: parsed.data.applicationId },
    data: { adminNotes: parsed.data.notes || null },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "application",
    entityId: parsed.data.applicationId,
    before: { adminNotes: existing.adminNotes },
    after: { adminNotes: parsed.data.notes || null },
  });

  const application = await prisma.application.findUnique({
    where: { id: parsed.data.applicationId },
    select: { status: true, userId: true, agentId: true },
  });

  if (application) {
    await emitApplicationChange({
      applicationId: parsed.data.applicationId,
      userId: application.userId,
      agentId: application.agentId,
      status: application.status,
      changeType: "notes",
    });
  }

  return successResult({ applicationId: parsed.data.applicationId });
}

export async function bulkAssignApplicationsAction(
  input: unknown,
): Promise<ActionResult<{ assignedCount: number; placeholder: true }>> {
  const user = await requireApplicationWritePermission();
  const parsed = parseInput(bulkAssignApplicationsSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "application_bulk_assign",
    entityId: null,
    after: {
      placeholder: true,
      applicationCount: parsed.data.applicationIds.length,
      agentId: parsed.data.agentId ?? null,
    },
  });

  return successResult({
    assignedCount: 0,
    placeholder: true,
  });
}

export async function requestCompletionProofUploadAction(
  input: unknown,
): Promise<
  ActionResult<{
    documentId: string;
    uploadUrl: string;
    expiresInSeconds: number;
  }>
> {
  const user = await requireApplicationWritePermission();
  await enforceRateLimit(serverActionRateLimit, `proof:${user.id}`);

  const parsed = parseInput(uploadCompletionProofSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const result = await handlePresignUpload(user, {
    applicationId: parsed.data.applicationId,
    docType: COMPLETION_PROOF_DOC_TYPE,
    fileName: parsed.data.fileName,
    mimeType: parsed.data.mimeType,
    fileSize: parsed.data.fileSize,
  });

  if ("error" in result) {
    return errorResult(result.error);
  }

  return successResult(result);
}

export async function confirmCompletionProofUploadAction(
  input: unknown,
): Promise<ActionResult<{ documentId: string }>> {
  const user = await requireApplicationWritePermission();

  const parsed = parseInput(confirmCompletionProofSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const result = await handleConfirmUpload(user, {
    documentId: parsed.data.documentId,
    applicationId: parsed.data.applicationId,
    checksum: parsed.data.checksum,
  });

  if ("error" in result) {
    return errorResult(result.error);
  }

  await auditAdminAction({
    actorId: user.id,
    action: "CREATE",
    entityType: "completion_proof",
    entityId: result.documentId,
    after: { applicationId: parsed.data.applicationId },
  });

  const application = await prisma.application.findUnique({
    where: { id: parsed.data.applicationId },
    select: { status: true, userId: true, agentId: true },
  });

  if (application) {
    await emitApplicationChange({
      applicationId: parsed.data.applicationId,
      userId: application.userId,
      agentId: application.agentId,
      status: application.status,
      changeType: "document",
    });
  }

  return successResult({ documentId: result.documentId });
}
