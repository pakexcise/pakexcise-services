import "server-only";

import type { ApplicationStatus, Prisma } from "@prisma/client";

import { COMPLETION_PROOF_DOC_TYPE } from "@/config/uploads";
import { findUploadedCompletionProof } from "@/features/applications/lib/completion-proof";
import { Repository } from "@/server/repositories/base/repository";

const agentApplicationListSelect = {
  id: true,
  trackingId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      name: true,
      email: true}},
  service: {
    select: {
      slug: true,
      nameEn: true}}} as const satisfies Prisma.ApplicationSelect;

export type AgentApplicationListItem = Prisma.ApplicationGetPayload<{
  select: typeof agentApplicationListSelect;
}>;

const agentApplicationDetailSelect = {
  id: true,
  trackingId: true,
  status: true,
  locale: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      name: true,
      email: true,
      phone: true}},
  service: {
    select: {
      nameEn: true,
      slug: true,
      region: {
        select: {
          nameEn: true}},
      documentReqs: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          docType: true,
          labelEn: true,
          isRequired: true}}}},
  fieldValues: {
    orderBy: { createdAt: "asc" },
    select: {
      fieldId: true,
      valuePlain: true,
      valueEncrypted: true,
      valueJson: true,
      isEncrypted: true,
      field: {
        select: {
          fieldKey: true,
          labelEn: true,
          fieldType: true,
          isEncrypted: true}}}},
  documents: {
    where: { type: { not: COMPLETION_PROOF_DOC_TYPE } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      type: true,
      fileName: true,
      status: true,
      rejectionReason: true,
      requirementId: true}},
  agentCommissions: {
    where: { payoutStatus: { not: "CANCELLED" } },
    orderBy: { createdAt: "desc" },
    take: 1,
    select: {
      id: true,
      label: true,
      amount: true,
      payoutStatus: true,
      agentReceiptStatus: true}},
  statusHistory: {
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      fromStatus: true,
      toStatus: true,
      createdAt: true}}} as const satisfies Prisma.ApplicationSelect;

export type AgentApplicationDetail = Prisma.ApplicationGetPayload<{
  select: typeof agentApplicationDetailSelect;
}>;

export type AgentApplicationStatusCounts = {
  total: number;
  inProgress: number;
  completed: number;
  closed: number;
};

export class AgentApplicationRepository extends Repository {
  async listForAgent(agentId: string): Promise<AgentApplicationListItem[]> {
    return this.db.application.findMany({
      where: {
        agentId,
        status: { not: "DRAFT" }},
      orderBy: { updatedAt: "desc" },
      select: agentApplicationListSelect});
  }

  async getStatusCountsForAgent(
    agentId: string,
  ): Promise<AgentApplicationStatusCounts> {
    const rows = await this.db.application.findMany({
      where: {
        agentId,
        status: { not: "DRAFT" }},
      select: { status: true }});

    const counts: AgentApplicationStatusCounts = {
      total: rows.length,
      inProgress: 0,
      completed: 0,
      closed: 0};

    const inProgress: ApplicationStatus[] = [
      "SUBMITTED",
      "REVIEW",
      "DOCS_REQUIRED",
      "INVOICE_SENT",
      "PAYMENT_UPLOADED",
      "PAYMENT_VERIFIED",
      "IN_PROGRESS",
      "AT_OFFICE"];
    const closed: ApplicationStatus[] = ["REJECTED", "CANCELLED"];

    for (const row of rows) {
      if (row.status === "COMPLETED") {
        counts.completed += 1;
      } else if (closed.includes(row.status)) {
        counts.closed += 1;
      } else if (inProgress.includes(row.status)) {
        counts.inProgress += 1;
      }
    }

    return counts;
  }

  async findAssignedById(input: { id: string; agentId: string }) {
    return this.db.application.findFirst({
      where: {
        id: input.id,
        agentId: input.agentId,
        status: { not: "DRAFT" }},
      select: agentApplicationDetailSelect});
  }

  async findCompletionProofForAssignedApplication(input: {
    applicationId: string;
    agentId: string;
  }) {
    const application = await this.db.application.findFirst({
      where: {
        id: input.applicationId,
        agentId: input.agentId,
        status: "COMPLETED"},
      select: { id: true }});

    if (!application) {
      return null;
    }

    return findUploadedCompletionProof(application.id);
  }

  async listByAgentForAdmin(agentUserId: string, limit = 20) {
    return this.db.application.findMany({
      where: {
        agentId: agentUserId,
        status: { not: "DRAFT" }},
      orderBy: { createdAt: "desc" },
      take: limit,
      select: agentApplicationListSelect});
  }
}

export const agentApplicationRepository = new AgentApplicationRepository();
