"use server";

import {
  agentProfileIdSchema,
  createAgentCommissionSchema,
  promoteUserToAgentSchema,
  rejectAgentSchema,
  toggleAgentActiveSchema,
  updateAgentCommissionRateSchema,
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
): Promise<ActionResult<{ agentProfileId: string; commissionRate: string }>> {
  const user = await requirePermission("agents:manage");
  await enforceRateLimit(serverActionRateLimit, `agent-rate:${user.id}`);

  const parsed = parseInput(updateAgentCommissionRateSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const profile = await getAgentProfileOrError(parsed.data.agentProfileId);

  if (!profile) {
    return errorResult("Agent profile not found");
  }

  const updated = await prisma.agentProfile.update({
    where: { id: profile.id },
    data: { commissionRate: parsed.data.commissionRate },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "agent_profile",
    entityId: profile.id,
    before: { commissionRate: profile.commissionRate.toString() },
    after: { commissionRate: updated.commissionRate.toString() },
  });

  return successResult({
    agentProfileId: updated.id,
    commissionRate: updated.commissionRate.toString(),
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

  if (parsed.data.applicationId) {
    const application = await prisma.application.findFirst({
      where: {
        id: parsed.data.applicationId,
        agentId: profile.userId,
      },
      select: { id: true },
    });

    if (!application) {
      return errorResult("Application is not assigned to this agent");
    }
  }

  const commission = await prisma.agentCommission.create({
    data: {
      agentProfileId: profile.id,
      applicationId: parsed.data.applicationId,
      label: parsed.data.label,
      description: parsed.data.description,
      amount: parsed.data.amount,
      payoutStatus: parsed.data.payoutStatus,
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
