import "server-only";

import type { AuditAction, Prisma } from "@prisma/client";

import { Repository } from "@/server/repositories/base/repository";

export type AdminAuditLogItem = {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  createdAt: Date;
};

export type AdminAuditLogListResult = {
  items: AdminAuditLogItem[];
  total: number;
  page: number;
  pageSize: number;
};

type ListAuditLogsInput = {
  page: number;
  pageSize: number;
  entityType?: string;
  action?: AuditAction;
  q?: string;
};

export class AdminAuditRepository extends Repository {
  async list(input: ListAuditLogsInput): Promise<AdminAuditLogListResult> {
    const where: Prisma.AuditLogWhereInput = {};

    if (input.entityType?.trim()) {
      where.entityType = { contains: input.entityType.trim(), mode: "insensitive" };
    }

    if (input.action) {
      where.action = input.action;
    }

    if (input.q?.trim()) {
      const query = input.q.trim();
      where.OR = [
        { entityType: { contains: query, mode: "insensitive" } },
        { entityId: { contains: query, mode: "insensitive" } },
        { actor: { email: { contains: query, mode: "insensitive" } } },
        { actor: { name: { contains: query, mode: "insensitive" } } },
      ];
    }

    const skip = (input.page - 1) * input.pageSize;

    const [rows, total] = await Promise.all([
      this.db.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: input.pageSize,
        select: {
          id: true,
          action: true,
          entityType: true,
          entityId: true,
          createdAt: true,
          actor: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      this.db.auditLog.count({ where }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        action: row.action,
        entityType: row.entityType,
        entityId: row.entityId,
        actorName: row.actor?.name ?? null,
        actorEmail: row.actor?.email ?? null,
        createdAt: row.createdAt,
      })),
      total,
      page: input.page,
      pageSize: input.pageSize,
    };
  }
}

export const adminAuditRepository = new AdminAuditRepository();
