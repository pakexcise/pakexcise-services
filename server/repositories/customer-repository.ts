import "server-only";

import type { Prisma, UserStatus } from "@prisma/client";

import {
  paginate,
  Repository,
  type PaginatedResult,
} from "@/server/repositories/base/repository";

const adminCustomerListSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  phoneNumber: true,
  emailVerified: true,
  phoneNumberVerified: true,
  status: true,
  createdAt: true,
  _count: {
    select: {
      customerApplications: true,
    },
  },
} as const satisfies Prisma.UserSelect;

export type AdminCustomerListItem = Prisma.UserGetPayload<{
  select: typeof adminCustomerListSelect;
}>;

export class CustomerRepository extends Repository {
  async listForSelect(): Promise<
    Array<{
      id: string;
      name: string | null;
      email: string;
      phone: string | null;
    }>
  > {
    return this.db.user.findMany({
      where: {
        role: "CUSTOMER",
        deletedAt: null,
      },
      orderBy: [{ name: "asc" }, { email: "asc" }],
      take: 500,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });
  }

  async listForAdmin(input?: {
    page?: number;
    pageSize?: number;
    status?: UserStatus;
    search?: string;
  }): Promise<PaginatedResult<AdminCustomerListItem>> {
    const page = input?.page ?? 1;
    const pageSize = input?.pageSize ?? 20;

    const where: Prisma.UserWhereInput = {
      role: "CUSTOMER",
      deletedAt: null,
    };

    if (input?.status) {
      where.status = input.status;
    }

    if (input?.search?.trim()) {
      const q = input.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { phoneNumber: { contains: q, mode: "insensitive" } },
      ];
    }

    return paginate(
      ({ skip, take }) =>
        this.db.user.findMany({
          skip,
          take,
          where,
          orderBy: { createdAt: "desc" },
          select: adminCustomerListSelect,
        }),
      () => this.db.user.count({ where }),
      { page, pageSize },
    );
  }
}

export const customerRepository = new CustomerRepository();
