import "server-only";

import type { AgentApprovalStatus, AgentPayoutStatus, AgentReceiptStatus, Prisma } from "@prisma/client";

import {
  Repository,
  type PaginatedResult,
} from "@/server/repositories/base/repository";

const adminAgentListSelect = {
  id: true,
  approvalStatus: true,
  commissionMode: true,
  commissionRate: true,
  commissionFixedAmount: true,
  notes: true,
  isActive: true,
  payoutMethodType: true,
  payoutAccountTitle: true,
  payoutAccountNumber: true,
  payoutIban: true,
  payoutBankName: true,
  payoutWalletNumber: true,
  payoutNotes: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      createdAt: true,
    },
  },
  _count: {
    select: {
      commissions: true,
    },
  },
} as const satisfies Prisma.AgentProfileSelect;

export type AdminAgentListItem = Prisma.AgentProfileGetPayload<{
  select: typeof adminAgentListSelect;
}>;

const agentCommissionListSelect = {
  id: true,
  agentProfileId: true,
  label: true,
  description: true,
  amount: true,
  currency: true,
  source: true,
  payoutStatus: true,
  proofR2Key: true,
  proofMimeType: true,
  proofFileName: true,
  paidAt: true,
  agentReceiptStatus: true,
  agentConfirmedAt: true,
  agentDisputedAt: true,
  agentDisputeReason: true,
  adminResolutionNote: true,
  adminResolvedAt: true,
  createdAt: true,
  updatedAt: true,
  application: {
    select: {
      id: true,
      trackingId: true,
      service: {
        select: {
          nameEn: true,
          nameUr: true,
        },
      },
    },
  },
} as const satisfies Prisma.AgentCommissionSelect;

export type AgentCommissionListItem = Prisma.AgentCommissionGetPayload<{
  select: typeof agentCommissionListSelect;
}>;

const agentCommissionSelect = {
  ...agentCommissionListSelect,
  agentProfile: {
    select: {
      id: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
} as const satisfies Prisma.AgentCommissionSelect;

export type AgentCommissionItem = Prisma.AgentCommissionGetPayload<{
  select: typeof agentCommissionSelect;
}>;

const activeAgentUserWhere = {
  role: "AGENT",
  deletedAt: null,
} as const satisfies Prisma.UserWhereInput;

function buildAdminAgentWhere(input?: {
  status?: AgentApprovalStatus;
  search?: string;
}): Prisma.AgentProfileWhereInput {
  const where: Prisma.AgentProfileWhereInput = {};

  if (input?.status) {
    where.approvalStatus = input.status;
  }

  if (input?.search?.trim()) {
    const q = input.search.trim();
    where.user = {
      ...activeAgentUserWhere,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
      ],
    };
  } else {
    where.user = activeAgentUserWhere;
  }

  return where;
}

export class AgentRepository extends Repository {
  async listForAdmin(input?: {
    page?: number;
    pageSize?: number;
    status?: AgentApprovalStatus;
    search?: string;
  }): Promise<PaginatedResult<AdminAgentListItem>> {
    const page = input?.page ?? 1;
    const pageSize = input?.pageSize ?? 20;
    const where = buildAdminAgentWhere(input);

    return this.paginateQuery(
      ({ skip, take }) =>
        this.db.agentProfile.findMany({
          skip,
          take,
          where,
          orderBy: { createdAt: "desc" },
          select: adminAgentListSelect,
        }),
      () => this.db.agentProfile.count({ where }),
      { page, pageSize },
    );
  }

  async findByIdForAdmin(id: string) {
    return this.db.agentProfile.findFirst({
      where: {
        id,
        user: activeAgentUserWhere,
      },
      select: {
        ...adminAgentListSelect,
        commissions: {
          orderBy: { createdAt: "desc" },
          select: agentCommissionListSelect,
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return this.db.agentProfile.findUnique({
      where: { userId },
    });
  }

  async listCommissionsForAgent(
    agentProfileId: string,
  ): Promise<AgentCommissionListItem[]> {
    return this.db.agentCommission.findMany({
      where: { agentProfileId },
      orderBy: { createdAt: "desc" },
      select: agentCommissionListSelect,
    });
  }

  async listCommissionsByAgentProfileIds(
    agentProfileIds: string[],
  ): Promise<Record<string, AgentCommissionListItem[]>> {
    if (agentProfileIds.length === 0) {
      return {};
    }

    const rows = await this.db.agentCommission.findMany({
      where: { agentProfileId: { in: agentProfileIds } },
      orderBy: { createdAt: "desc" },
      select: agentCommissionListSelect,
    });

    const grouped: Record<string, AgentCommissionListItem[]> = {};

    for (const row of rows) {
      const bucket = grouped[row.agentProfileId] ?? [];
      bucket.push(row);
      grouped[row.agentProfileId] = bucket;
    }

    return grouped;
  }

  async listCommissionsForAdmin(input?: {
    page?: number;
    pageSize?: number;
    status?: AgentPayoutStatus;
    receiptStatus?: AgentReceiptStatus;
    search?: string;
  }): Promise<PaginatedResult<AgentCommissionItem>> {
    const page = input?.page ?? 1;
    const pageSize = input?.pageSize ?? 20;

    const where: Prisma.AgentCommissionWhereInput = {
      agentProfile: {
        user: activeAgentUserWhere,
      },
    };

    if (input?.status) {
      where.payoutStatus = input.status;
    }

    if (input?.receiptStatus) {
      where.agentReceiptStatus = input.receiptStatus;
      if (input.receiptStatus !== "AWAITING") {
        where.payoutStatus = "PAID";
      }
    }

    if (input?.search?.trim()) {
      const q = input.search.trim();
      where.OR = [
        { label: { contains: q, mode: "insensitive" } },
        { application: { trackingId: { contains: q, mode: "insensitive" } } },
        {
          agentProfile: {
            user: {
              ...activeAgentUserWhere,
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            },
          },
        },
      ];
    }

    return this.paginateQuery(
      ({ skip, take }) =>
        this.db.agentCommission.findMany({
          skip,
          take,
          where,
          orderBy: { createdAt: "desc" },
          select: agentCommissionSelect,
        }),
      () => this.db.agentCommission.count({ where }),
      { page, pageSize },
    );
  }

  async countApplicationsByAgent(agentUserId: string): Promise<number> {
    return this.db.application.count({
      where: {
        agentId: agentUserId,
        status: { not: "DRAFT" },
      },
    });
  }

  async countApplicationsByAgentUserIds(
    agentUserIds: string[],
  ): Promise<Record<string, number>> {
    if (agentUserIds.length === 0) {
      return {};
    }

    const rows = await this.db.application.groupBy({
      by: ["agentId"],
      where: {
        agentId: { in: agentUserIds },
        status: { not: "DRAFT" },
      },
      _count: { _all: true },
    });

    return Object.fromEntries(
      rows
        .filter((row): row is typeof row & { agentId: string } =>
          Boolean(row.agentId),
        )
        .map((row) => [row.agentId, row._count._all]),
    );
  }

  async getAdminStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    active: number;
    inactive: number;
  }> {
    const baseWhere = { user: activeAgentUserWhere };

    const [total, pending, approved, rejected, active, inactive] =
      await Promise.all([
        this.db.agentProfile.count({ where: baseWhere }),
        this.db.agentProfile.count({
          where: { ...baseWhere, approvalStatus: "PENDING" },
        }),
        this.db.agentProfile.count({
          where: { ...baseWhere, approvalStatus: "APPROVED" },
        }),
        this.db.agentProfile.count({
          where: { ...baseWhere, approvalStatus: "REJECTED" },
        }),
        this.db.agentProfile.count({
          where: {
            ...baseWhere,
            approvalStatus: "APPROVED",
            isActive: true,
          },
        }),
        this.db.agentProfile.count({
          where: {
            ...baseWhere,
            approvalStatus: "APPROVED",
            isActive: false,
          },
        }),
      ]);

    return { total, pending, approved, rejected, active, inactive };
  }
}

export const agentRepository = new AgentRepository();
