import "server-only";

import type { Prisma, UserRole, UserStatus } from "@prisma/client";

import { adminDefaultPageSize } from "@/config/admin";
import {
  Repository,
  type PaginatedResult,
} from "@/server/repositories/base/repository";

const staffListSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  twoFactorEnabled: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.UserSelect;

export type AdminStaffListItem = Prisma.UserGetPayload<{
  select: typeof staffListSelect;
}>;

const staffRoles: UserRole[] = ["ADMIN", "SUPER_ADMIN", "SUPPORT"];

export class AdminStaffRepository extends Repository {
  async listForAdmin(input?: {
    page?: number;
    pageSize?: number;
    status?: UserStatus;
    role?: UserRole;
    search?: string;
  }): Promise<PaginatedResult<AdminStaffListItem>> {
    const page = input?.page ?? 1;
    const pageSize = input?.pageSize ?? adminDefaultPageSize;

    const where: Prisma.UserWhereInput = {
      role: { in: staffRoles },
      deletedAt: null,
    };

    if (input?.status) {
      where.status = input.status;
    }

    if (input?.role) {
      where.role = input.role;
    }

    if (input?.search?.trim()) {
      const q = input.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }

    return this.paginateQuery(
      ({ skip, take }) =>
        this.db.user.findMany({
          where,
          orderBy: [{ role: "desc" }, { createdAt: "desc" }],
          select: staffListSelect,
          skip,
          take,
        }),
      () => this.db.user.count({ where }),
      { page, pageSize },
    );
  }

  async findStaffById(id: string) {
    return this.db.user.findFirst({
      where: {
        id,
        role: { in: staffRoles },
        deletedAt: null,
      },
      select: {
        ...staffListSelect,
        emailVerified: true,
      },
    });
  }

  async countSuperAdmins(excludeUserId?: string): Promise<number> {
    return this.db.user.count({
      where: {
        role: "SUPER_ADMIN",
        deletedAt: null,
        status: "ACTIVE",
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
    });
  }
}

export const adminStaffRepository = new AdminStaffRepository();
