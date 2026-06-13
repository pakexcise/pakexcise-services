"use server";

import {
  PAYMENT_SCREENSHOT_MAX_BYTES,
  buildCommissionProofKey,
  validateUploadFile,
} from "@/config/uploads";
import {
  agentProfileIdSchema,
  confirmCommissionPaidSchema,
  createAgentCommissionSchema,
  cancelAgentCommissionSchema,
  abortCommissionProofUploadSchema,
  promoteUserToAgentSchema,
  rejectAgentSchema,
  requestCommissionProofUploadSchema,
  toggleAgentActiveSchema,
  updateAgentCommissionConfigSchema,
  updateAgentCommissionSchema,
} from "@/features/admin/agents/validators";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import { requirePermission } from "@/server/permissions/guards";
import {
  headStoredObject,
  isObjectStorageConfigured,
} from "@/server/storage/object-storage";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

async function getAgentProfileOrError(agentProfileId: string) {
  const profile = await prisma.agentProfile.findUnique({
    where: { id: agentProfileId },
    include: {
      user: { select: { id: true, role: true, email: true } },
    },
  });

  if (!profile) {
    return null;
  }

  if (profile.user.role !== "AGENT") {
    return null;
  }

  return profile;
}

export async function approveAgentAction(
  input: unknown,
): Promise<ActionResult<{ agentProfileId: string; status: string }>> {
  const user = await requirePermission("agents:manage");
  await enforceRateLimit(serverActionRateLimit, `agent-approve:${user.id}`);

  const parsed = parseInput(agentProfileIdSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const profile = await getAgentProfileOrError(parsed.data.agentProfileId);

  if (!profile) {
    return errorResult("Agent profile not found");
  }

  const updated = await prisma.agentProfile.update({
    where: { id: profile.id },
    data: {
      approvalStatus: "APPROVED",
      isActive: true,
    },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "agent_profile",
    entityId: profile.id,
    before: { approvalStatus: profile.approvalStatus, isActive: profile.isActive },
    after: { approvalStatus: updated.approvalStatus, isActive: updated.isActive },
  });

  return successResult({
    agentProfileId: updated.id,
    status: updated.approvalStatus,
  });
}

export async function rejectAgentAction(
  input: unknown,
): Promise<ActionResult<{ agentProfileId: string; status: string }>> {
  const user = await requirePermission("agents:manage");
  await enforceRateLimit(serverActionRateLimit, `agent-reject:${user.id}`);

  const parsed = parseInput(rejectAgentSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const profile = await getAgentProfileOrError(parsed.data.agentProfileId);

  if (!profile) {
    return errorResult("Agent profile not found");
  }

  const updated = await prisma.agentProfile.update({
    where: { id: profile.id },
    data: {
      approvalStatus: "REJECTED",
      isActive: false,
      notes: parsed.data.notes,
    },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "agent_profile",
    entityId: profile.id,
    before: {
      approvalStatus: profile.approvalStatus,
      isActive: profile.isActive,
    },
    after: {
      approvalStatus: updated.approvalStatus,
      isActive: updated.isActive,
      notes: parsed.data.notes,
    },
  });

  return successResult({
    agentProfileId: updated.id,
    status: updated.approvalStatus,
  });
}

export async function updateAgentCommissionRateAction(
  input: unknown,
): Promise<
  ActionResult<{
    agentProfileId: string;
    commissionMode: string;
    commissionRate: string;
    commissionFixedAmount: string | null;
  }>
> {
  return updateAgentCommissionConfigAction(input);
}

export async function updateAgentCommissionConfigAction(
  input: unknown,
): Promise<
  ActionResult<{
    agentProfileId: string;
    commissionMode: string;
    commissionRate: string;
    commissionFixedAmount: string | null;
  }>
> {
  const user = await requirePermission("agents:manage");
  await enforceRateLimit(serverActionRateLimit, `agent-rate:${user.id}`);

  const parsed = parseInput(updateAgentCommissionConfigSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const profile = await getAgentProfileOrError(parsed.data.agentProfileId);

  if (!profile) {
    return errorResult("Agent profile not found");
  }

  const updated = await prisma.agentProfile.update({
    where: { id: profile.id },
    data: {
      commissionMode: parsed.data.commissionMode,
      commissionRate:
        parsed.data.commissionMode === "PERCENTAGE"
          ? (parsed.data.commissionRate ?? 0)
          : 0,
      commissionFixedAmount:
        parsed.data.commissionMode === "FIXED"
          ? (parsed.data.commissionFixedAmount ?? null)
          : null,
    },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "agent_profile",
    entityId: profile.id,
    before: {
      commissionMode: profile.commissionMode,
      commissionRate: profile.commissionRate.toString(),
      commissionFixedAmount: profile.commissionFixedAmount?.toString() ?? null,
    },
    after: {
      commissionMode: updated.commissionMode,
      commissionRate: updated.commissionRate.toString(),
      commissionFixedAmount: updated.commissionFixedAmount?.toString() ?? null,
    },
  });

  return successResult({
    agentProfileId: updated.id,
    commissionMode: updated.commissionMode,
    commissionRate: updated.commissionRate.toString(),
    commissionFixedAmount: updated.commissionFixedAmount?.toString() ?? null,
  });
}

export async function toggleAgentActiveAction(
  input: unknown,
): Promise<ActionResult<{ agentProfileId: string; isActive: boolean }>> {
  const user = await requirePermission("agents:manage");
  const parsed = parseInput(toggleAgentActiveSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const profile = await getAgentProfileOrError(parsed.data.agentProfileId);

  if (!profile) {
    return errorResult("Agent profile not found");
  }

  const updated = await prisma.agentProfile.update({
    where: { id: profile.id },
    data: { isActive: parsed.data.isActive },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "agent_profile",
    entityId: profile.id,
    before: { isActive: profile.isActive },
    after: { isActive: updated.isActive },
  });

  return successResult({
    agentProfileId: updated.id,
    isActive: updated.isActive,
  });
}

export async function createAgentCommissionAction(
  input: unknown,
): Promise<ActionResult<{ commissionId: string }>> {
  const user = await requirePermission("agents:manage");
  await enforceRateLimit(serverActionRateLimit, `agent-commission:${user.id}`);

  const parsed = parseInput(createAgentCommissionSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const profile = await getAgentProfileOrError(parsed.data.agentProfileId);

  if (!profile) {
    return errorResult("Agent profile not found");
  }

  const application = await prisma.application.findFirst({
    where: {
      trackingId: parsed.data.trackingId.toUpperCase(),
      agentId: profile.userId,
    },
    select: { id: true, trackingId: true },
  });

  if (!application) {
    return errorResult("Application not found for this agent");
  }

  const existing = await prisma.agentCommission.findFirst({
    where: {
      applicationId: application.id,
      source: "MANUAL",
      payoutStatus: { not: "CANCELLED" },
    },
    select: { id: true },
  });

  if (existing) {
    return errorResult("A manual payout already exists for this application");
  }

  const commission = await prisma.agentCommission.create({
    data: {
      agentProfileId: profile.id,
      applicationId: application.id,
      label: parsed.data.label,
      description: parsed.data.description,
      amount: parsed.data.amount,
      source: "MANUAL",
      payoutStatus: "PENDING",
    },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "CREATE",
    entityType: "agent_commission",
    entityId: commission.id,
    after: {
      agentProfileId: profile.id,
      label: commission.label,
      amount: commission.amount.toString(),
      payoutStatus: commission.payoutStatus,
    },
  });

  return successResult({ commissionId: commission.id });
}

async function getCommissionForAdmin(commissionId: string) {
  return prisma.agentCommission.findFirst({
    where: {
      id: commissionId,
      agentProfile: {
        user: {
          role: "AGENT",
          deletedAt: null,
        },
      },
    },
    include: {
      application: {
        select: {
          id: true,
          trackingId: true,
        },
      },
      agentProfile: {
        select: {
          userId: true,
        },
      },
    },
  });
}

export async function requestCommissionProofUploadAction(
  input: unknown,
): Promise<
  ActionResult<{
    commissionId: string;
  }>
> {
  if (!isObjectStorageConfigured()) {
    return errorResult("Proof upload is not available");
  }

  const user = await requirePermission("agents:manage");
  await enforceRateLimit(serverActionRateLimit, `commission-proof:${user.id}`);

  const parsed = parseInput(requestCommissionProofUploadSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const commission = await getCommissionForAdmin(parsed.data.commissionId);

  if (!commission) {
    return errorResult("Commission not found");
  }

  if (commission.payoutStatus === "PAID") {
    if (commission.agentReceiptStatus !== "NOT_RECEIVED") {
      return errorResult("Commission is already marked as paid");
    }
  } else if (commission.payoutStatus === "CANCELLED") {
    return errorResult("Cancelled commissions cannot be paid");
  }

  const validation = validateUploadFile({
    fileName: parsed.data.fileName,
    mimeType: parsed.data.mimeType,
    fileSize: parsed.data.fileSize,
    maxSizeBytes: PAYMENT_SCREENSHOT_MAX_BYTES,
  });

  if (!validation.valid) {
    return errorResult("Invalid proof file");
  }

  const trackingId = commission.application?.trackingId;

  if (!trackingId) {
    return errorResult("Commission must be linked to an application before payment proof upload");
  }

  const proofR2Key = buildCommissionProofKey({
    trackingId,
    commissionId: commission.id,
    extension: validation.extension,
  });

  try {
    await prisma.agentCommission.update({
      where: { id: commission.id },
      data: {
        payoutStatus: "PROCESSING",
        proofR2Key,
        proofMimeType: parsed.data.mimeType,
        proofFileName: parsed.data.fileName,
        proofFileSize: parsed.data.fileSize,
      },
    });

    return successResult({
      commissionId: commission.id,
    });
  } catch {
    return errorResult("Could not prepare proof upload");
  }
}

export async function confirmCommissionPaidAction(
  input: unknown,
): Promise<ActionResult<{ commissionId: string; payoutStatus: string }>> {
  const user = await requirePermission("agents:manage");
  const parsed = parseInput(confirmCommissionPaidSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const commission = await getCommissionForAdmin(parsed.data.commissionId);

  if (!commission || !commission.proofR2Key) {
    return errorResult("Commission proof upload not found");
  }

  const head = await headStoredObject(commission.proofR2Key);

  if (!head?.contentLength) {
    return errorResult("Uploaded proof was not found in storage");
  }

  const isDisputeResolution = commission.agentReceiptStatus === "NOT_RECEIVED";
  const resolutionNote = parsed.data.resolutionNote?.trim();

  if (isDisputeResolution && !resolutionNote) {
    return errorResult("Resolution note is required when resolving a dispute");
  }

  const now = new Date();

  const updated = await prisma.agentCommission.update({
    where: { id: commission.id },
    data: {
      payoutStatus: "PAID",
      proofFileSize: head.contentLength,
      paidAt: commission.paidAt ?? now,
      paidById: commission.paidById ?? user.id,
      agentReceiptStatus: "AWAITING",
      agentConfirmedAt: null,
      agentDisputedAt: null,
      agentDisputeReason: null,
      ...(isDisputeResolution
        ? {
            adminResolutionNote: resolutionNote,
            adminResolvedAt: now,
            adminResolvedById: user.id,
          }
        : {}),
    },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "agent_commission",
    entityId: commission.id,
    before: { payoutStatus: commission.payoutStatus },
    after: {
      payoutStatus: updated.payoutStatus,
      paidAt: updated.paidAt?.toISOString() ?? null,
    },
  });

  return successResult({
    commissionId: updated.id,
    payoutStatus: updated.payoutStatus,
  });
}

export async function updateAgentCommissionAction(
  input: unknown,
): Promise<ActionResult<{ commissionId: string }>> {
  const user = await requirePermission("agents:manage");
  await enforceRateLimit(serverActionRateLimit, `agent-commission-update:${user.id}`);

  const parsed = parseInput(updateAgentCommissionSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const commission = await getCommissionForAdmin(parsed.data.commissionId);

  if (!commission) {
    return errorResult("Commission not found");
  }

  if (
    commission.payoutStatus !== "PENDING" &&
    commission.payoutStatus !== "PROCESSING"
  ) {
    return errorResult("Only pending or processing payouts can be edited");
  }

  let applicationId = commission.applicationId;

  if (commission.source === "MANUAL") {
    const trackingId = parsed.data.trackingId?.trim().toUpperCase();

    if (!trackingId && !commission.application?.trackingId) {
      return errorResult("Tracking ID is required for manual payouts");
    }

    const resolvedTrackingId =
      trackingId ?? commission.application?.trackingId ?? "";

    if (
      resolvedTrackingId &&
      resolvedTrackingId !== commission.application?.trackingId
    ) {
      const application = await prisma.application.findFirst({
        where: {
          trackingId: resolvedTrackingId,
          agentId: commission.agentProfile.userId,
        },
        select: { id: true, trackingId: true },
      });

      if (!application) {
        return errorResult("Application not found for this agent");
      }

      const duplicate = await prisma.agentCommission.findFirst({
        where: {
          id: { not: commission.id },
          applicationId: application.id,
          source: "MANUAL",
          payoutStatus: { not: "CANCELLED" },
        },
        select: { id: true },
      });

      if (duplicate) {
        return errorResult("A manual payout already exists for this application");
      }

      applicationId = application.id;
    }
  }

  const shouldResetProof = commission.payoutStatus === "PROCESSING";

  const updated = await prisma.agentCommission.update({
    where: { id: commission.id },
    data: {
      label: parsed.data.label,
      description: parsed.data.description,
      amount: parsed.data.amount,
      applicationId,
      ...(shouldResetProof
        ? {
            payoutStatus: "PENDING",
            proofR2Key: null,
            proofMimeType: null,
            proofFileName: null,
            proofFileSize: null,
          }
        : {}),
    },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "agent_commission",
    entityId: commission.id,
    before: {
      label: commission.label,
      amount: commission.amount.toString(),
      payoutStatus: commission.payoutStatus,
      applicationId: commission.applicationId,
    },
    after: {
      label: updated.label,
      amount: updated.amount.toString(),
      payoutStatus: updated.payoutStatus,
      applicationId: updated.applicationId,
    },
  });

  return successResult({ commissionId: updated.id });
}

export async function cancelAgentCommissionAction(
  input: unknown,
): Promise<ActionResult<{ commissionId: string; payoutStatus: string }>> {
  const user = await requirePermission("agents:manage");
  await enforceRateLimit(serverActionRateLimit, `agent-commission-cancel:${user.id}`);

  const parsed = parseInput(cancelAgentCommissionSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const commission = await getCommissionForAdmin(parsed.data.commissionId);

  if (!commission) {
    return errorResult("Commission not found");
  }

  if (
    commission.payoutStatus !== "PENDING" &&
    commission.payoutStatus !== "PROCESSING"
  ) {
    return errorResult("Only pending or processing payouts can be cancelled");
  }

  const updated = await prisma.agentCommission.update({
    where: { id: commission.id },
    data: {
      payoutStatus: "CANCELLED",
      proofR2Key: null,
      proofMimeType: null,
      proofFileName: null,
      proofFileSize: null,
    },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "agent_commission",
    entityId: commission.id,
    before: { payoutStatus: commission.payoutStatus },
    after: { payoutStatus: updated.payoutStatus },
  });

  return successResult({
    commissionId: updated.id,
    payoutStatus: updated.payoutStatus,
  });
}

export async function abortCommissionProofUploadAction(
  input: unknown,
): Promise<ActionResult<{ commissionId: string; payoutStatus: string }>> {
  const user = await requirePermission("agents:manage");
  const parsed = parseInput(abortCommissionProofUploadSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const commission = await getCommissionForAdmin(parsed.data.commissionId);

  if (!commission) {
    return errorResult("Commission not found");
  }

  if (commission.payoutStatus !== "PROCESSING") {
    return successResult({
      commissionId: commission.id,
      payoutStatus: commission.payoutStatus,
    });
  }

  const isDisputeAbort = commission.agentReceiptStatus === "NOT_RECEIVED";

  const updated = await prisma.agentCommission.update({
    where: { id: commission.id },
    data: isDisputeAbort
      ? {
          payoutStatus: "PAID",
          proofR2Key: null,
          proofMimeType: null,
          proofFileName: null,
          proofFileSize: null,
        }
      : {
          payoutStatus: "PENDING",
          proofR2Key: null,
          proofMimeType: null,
          proofFileName: null,
          proofFileSize: null,
        },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "agent_commission",
    entityId: commission.id,
    before: { payoutStatus: commission.payoutStatus },
    after: { payoutStatus: updated.payoutStatus },
  });

  return successResult({
    commissionId: updated.id,
    payoutStatus: updated.payoutStatus,
  });
}

export async function promoteUserToAgentAction(
  input: unknown,
): Promise<ActionResult<{ agentProfileId: string }>> {
  const user = await requirePermission("agents:manage");
  const parsed = parseInput(promoteUserToAgentSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const targetUser = await prisma.user.findFirst({
    where: {
      id: parsed.data.userId,
      deletedAt: null,
    },
    include: { agentProfile: true },
  });

  if (!targetUser) {
    return errorResult("User not found");
  }

  if (targetUser.agentProfile) {
    return errorResult("User already has an agent profile");
  }

  const [updatedUser, profile] = await prisma.$transaction([
    prisma.user.update({
      where: { id: targetUser.id },
      data: { role: "AGENT" },
    }),
    prisma.agentProfile.create({
      data: {
        userId: targetUser.id,
        approvalStatus: "PENDING",
        notes: parsed.data.notes,
      },
    }),
  ]);

  await auditAdminAction({
    actorId: user.id,
    action: "CREATE",
    entityType: "agent_profile",
    entityId: profile.id,
    after: {
      userId: updatedUser.id,
      approvalStatus: profile.approvalStatus,
      role: "AGENT",
    },
  });

  return successResult({ agentProfileId: profile.id });
}
