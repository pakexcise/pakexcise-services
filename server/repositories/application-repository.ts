import "server-only";

import type { ApplicationStatus, Prisma } from "@prisma/client";

import {
  paginate,
  Repository,
  type PaginatedResult,
} from "@/server/repositories/base/repository";

export type ApplicationDashboardStats = {
  total: number;
  review: number;
  docsRequired: number;
  invoiceSent: number;
  paymentUploaded: number;
  paymentVerified: number;
  inProgress: number;
  completed: number;
  rejectedCancelled: number;
};

const adminApplicationListSelect = {
  id: true,
  trackingId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  service: {
    select: {
      id: true,
      slug: true,
      nameEn: true,
      nameUr: true,
    },
  },
  agent: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const satisfies Prisma.ApplicationSelect;

export type AdminApplicationListItem = Prisma.ApplicationGetPayload<{
  select: typeof adminApplicationListSelect;
}>;

const adminApplicationDetailSelect = {
  ...adminApplicationListSelect,
  locale: true,
  adminNotes: true,
  statusHistory: {
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      toStatus: true,
      note: true,
      createdAt: true,
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
} as const satisfies Prisma.ApplicationSelect;

export type AdminApplicationDetail = Prisma.ApplicationGetPayload<{
  select: typeof adminApplicationDetailSelect;
}>;

export type AdminApplicationListFilters = {
  page?: number;
  pageSize?: number;
  status?: ApplicationStatus;
  search?: string;
};

export class ApplicationRepository extends Repository {
  async getDashboardStats(): Promise<ApplicationDashboardStats> {
    const [
      total,
      review,
      docsRequired,
      invoiceSent,
      paymentUploaded,
      paymentVerified,
      inProgress,
      atOffice,
      completed,
      rejected,
      cancelled,
    ] = await Promise.all([
      this.db.application.count(),
      this.db.application.count({ where: { status: "REVIEW" } }),
      this.db.application.count({ where: { status: "DOCS_REQUIRED" } }),
      this.db.application.count({ where: { status: "INVOICE_SENT" } }),
      this.db.application.count({ where: { status: "PAYMENT_UPLOADED" } }),
      this.db.application.count({ where: { status: "PAYMENT_VERIFIED" } }),
      this.db.application.count({ where: { status: "IN_PROGRESS" } }),
      this.db.application.count({ where: { status: "AT_OFFICE" } }),
      this.db.application.count({ where: { status: "COMPLETED" } }),
      this.db.application.count({ where: { status: "REJECTED" } }),
      this.db.application.count({ where: { status: "CANCELLED" } }),
    ]);

    return {
      total,
      review,
      docsRequired,
      invoiceSent,
      paymentUploaded,
      paymentVerified,
      inProgress: inProgress + atOffice,
      completed,
      rejectedCancelled: rejected + cancelled,
    };
  }

  async listRecent(limit = 10): Promise<AdminApplicationListItem[]> {
    return this.db.application.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: adminApplicationListSelect,
    });
  }

  buildAdminListWhere(
    filters: AdminApplicationListFilters,
  ): Prisma.ApplicationWhereInput {
    const where: Prisma.ApplicationWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search?.trim()) {
      const query = filters.search.trim();
      where.OR = [
        { trackingId: { contains: query, mode: "insensitive" } },
        { user: { email: { contains: query, mode: "insensitive" } } },
        { user: { name: { contains: query, mode: "insensitive" } } },
        { service: { nameEn: { contains: query, mode: "insensitive" } } },
        { service: { nameUr: { contains: query, mode: "insensitive" } } },
      ];
    }

    return where;
  }

  async listAdminPaginated(
    filters: AdminApplicationListFilters = {},
  ): Promise<PaginatedResult<AdminApplicationListItem>> {
    const pageSize = Math.min(filters.pageSize ?? 20, 100);
    const where = this.buildAdminListWhere(filters);

    return paginate(
      ({ skip, take }) =>
        this.db.application.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
          select: adminApplicationListSelect,
        }),
      () => this.db.application.count({ where }),
      { page: filters.page, pageSize },
    );
  }

  async findAdminById(id: string): Promise<AdminApplicationDetail | null> {
    return this.db.application.findUnique({
      where: { id },
      select: adminApplicationDetailSelect,
    });
  }
}

export const applicationRepository = new ApplicationRepository();
