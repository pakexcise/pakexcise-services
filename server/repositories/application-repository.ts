import "server-only";

import type { ApplicationStatus, Prisma } from "@prisma/client";
import { createHash } from "node:crypto";

import { authConfig } from "@/config/auth";
import { adminPipelineStatuses } from "@/features/applications/status-machine";
import { normalizePakistanPhone } from "@/lib/validations/phone";
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

export type AdminStatusCounts = Record<ApplicationStatus, number>;

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
      phone: true,
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
  service: {
    select: {
      id: true,
      slug: true,
      nameEn: true,
      nameUr: true,
      requiresProof: true,
      region: {
        select: {
          nameEn: true,
          nameUr: true,
        },
      },
    },
  },
  fieldValues: {
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      fieldId: true,
      valuePlain: true,
      valueEncrypted: true,
      valueJson: true,
      isEncrypted: true,
      field: {
        select: {
          fieldKey: true,
          labelEn: true,
          labelUr: true,
          fieldType: true,
          isEncrypted: true,
          displayOrder: true,
        },
      },
    },
  },
  documents: {
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      type: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
      status: true,
      rejectionReason: true,
      createdAt: true,
      requirement: {
        select: {
          labelEn: true,
          labelUr: true,
          isRequired: true,
        },
      },
    },
  },
  invoices: {
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      invoiceNumber: true,
      status: true,
      subtotal: true,
      taxTotal: true,
      total: true,
      currency: true,
      notes: true,
      officialFeeNote: true,
      paymentMethod: true,
      paymentInstructions: true,
      locale: true,
      pdfR2Key: true,
      sentAt: true,
      dueAt: true,
      createdAt: true,
      lineItems: {
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          label: true,
          description: true,
          amount: true,
          isOfficialFee: true,
        },
      },
    },
  },
  payments: {
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      amount: true,
      rejectionReason: true,
      screenshotFileName: true,
      screenshotMimeType: true,
      screenshotFileSize: true,
      verifiedAt: true,
      createdAt: true,
      invoice: {
        select: {
          invoiceNumber: true,
        },
      },
    },
  },
  statusHistory: {
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fromStatus: true,
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
  serviceId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  excludeDraft?: boolean;
};

function hashAdminSearchToken(value: string): string | null {
  const pepper = process.env[authConfig.ipHashPepperEnvKey];

  if (!pepper) {
    return null;
  }

  return createHash("sha256").update(`${value}:${pepper}`).digest("hex");
}

function buildPhoneSearchVariants(query: string): string[] {
  const normalized = normalizePakistanPhone(query);
  const variants = new Set<string>([query.trim()]);

  if (normalized) {
    variants.add(normalized);
    variants.add(`0${normalized.slice(3)}`);
    variants.add(normalized.slice(3));
  }

  return Array.from(variants);
}

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
      this.db.application.count({
        where: { status: { not: "DRAFT" } },
      }),
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

  async getAdminPipelineStatusCounts(): Promise<Partial<AdminStatusCounts>> {
    const counts = await this.db.application.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: {
        status: { in: [...adminPipelineStatuses] },
      },
    });

    const result: Partial<AdminStatusCounts> = {};

    for (const row of counts) {
      result[row.status] = row._count._all;
    }

    return result;
  }

  async listRecent(limit = 10): Promise<AdminApplicationListItem[]> {
    return this.db.application.findMany({
      where: { status: { not: "DRAFT" } },
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
    } else if (filters.excludeDraft !== false) {
      where.status = { not: "DRAFT" };
    }

    if (filters.serviceId) {
      where.serviceId = filters.serviceId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {
        ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
        ...(filters.dateTo ? { lte: filters.dateTo } : {}),
      };
    }

    if (filters.search?.trim()) {
      const query = filters.search.trim();
      const orConditions: Prisma.ApplicationWhereInput[] = [
        { trackingId: { contains: query, mode: "insensitive" } },
        { user: { email: { contains: query, mode: "insensitive" } } },
        { user: { name: { contains: query, mode: "insensitive" } } },
        { service: { nameEn: { contains: query, mode: "insensitive" } } },
        { service: { nameUr: { contains: query, mode: "insensitive" } } },
      ];

      for (const phoneVariant of buildPhoneSearchVariants(query)) {
        orConditions.push({
          user: { phone: { contains: phoneVariant, mode: "insensitive" } },
        });
      }

      const hashed = hashAdminSearchToken(query);
      if (hashed) {
        orConditions.push({ trackingId: { contains: hashed.slice(0, 12) } });
      }

      where.OR = orConditions;
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

  async listServicesForFilter(): Promise<
    Array<{ id: string; nameEn: string; nameUr: string }>
  > {
    return this.db.service.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: [{ displayOrder: "asc" }, { nameEn: "asc" }],
      select: {
        id: true,
        nameEn: true,
        nameUr: true,
      },
    });
  }
}

export const applicationRepository = new ApplicationRepository();
