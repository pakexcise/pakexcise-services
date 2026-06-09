import "server-only";

import type { AgentApprovalStatus, Prisma } from "@prisma/client";

import {
  paginate,
  Repository,
  type PaginatedResult,
} from "@/server/repositories/base/repository";

const adminAgentListSelect = {
  id: true,
  approvalStatus: true,
  commissionRate: true,
  notes: true,
  isActive: true,
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

const agentCommissionSelect = {
  id: true,
  label: true,
  description: true,
  amount: true,
  currency: true,
  payoutStatus: true,
  createdAt: true,
  updatedAt: true,
  application: {
    select: {
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

export type AgentCommissionItem = Prisma.AgentCommissionGetPayload<{
  select: typeof agentCommissionSelect;
}>;

export class AgentRepository extends Repository {
  async listForAdmin(input?: {
    page?: number;
    pageSize?: number;
    status?: AgentApprovalStatus;
    search?: string;
  }): Promise<PaginatedResult<AdminAgentListItem>> {
    const page = input?.page ?? 1;
    const pageSize = input?.pageSize ?? 20;

    const where: Prisma.AgentProfileWhereInput = {};

    if (input?.status) {
      where.approvalStatus = input.status;
    }

    if (input?.search?.trim()) {
      const q = input.search.trim();
      where.user = {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
        ],
      };
    }

    return paginate({
      findMany: (args) =>
        this.db.agentProfile.findMany({
          ...args,
          where,
          orderBy: { createdAt: "desc" },
          select: adminAgentListSelect,
        }),
      count: () => this.db.agentProfile.count({ where }),
      page,
      pageSize,
    });
  }

  async findByIdForAdmin(id: string) {
    return this.db.agentProfile.findUnique({
      where: { id },
      select: {
        ...adminAgentListSelect,
        commissions: {
          orderBy: { createdAt: "desc" },
          select: agentCommissionSelect,
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return this.db.agentProfile.findUnique({
      where: { userId },
    });
  }

  async listCommissionsForAgent(agentProfileId: string): Promise<AgentCommissionItem[]> {
    return this.db.agentCommission.findMany({
      where: { agentProfileId },
      orderBy: { createdAt: "desc" },
      select: agentCommissionSelect,
    });
  }

  async countApplicationsByAgent(agentUserId: string): Promise<number> {
    return this.db.application.count({
      where: {
        agentId: agentUserId,
        status: { not: "DRAFT" },
      },
    });
  }
}

export const agentRepository = new AgentRepository();
