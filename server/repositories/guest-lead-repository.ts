import "server-only";

import type { GuestLeadStatus, Prisma } from "@prisma/client";

import { Repository } from "@/server/repositories/base/repository";

const guestLeadListSelect = {
  id: true,
  referenceId: true,
  source: true,
  status: true,
  serviceNameEn: true,
  regionNameEn: true,
  cityName: true,
  fullName: true,
  phone: true,
  email: true,
  locale: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.GuestLeadSelect;

const guestLeadDetailSelect = {
  ...guestLeadListSelect,
  vehicleInfo: true,
  licenseInfo: true,
  message: true,
  adminNotes: true,
  contactedAt: true,
  service: {
    select: {
      id: true,
      slug: true,
      nameEn: true,
    },
  },
  contactedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const satisfies Prisma.GuestLeadSelect;

export type GuestLeadListItem = Prisma.GuestLeadGetPayload<{
  select: typeof guestLeadListSelect;
}>;

export type GuestLeadDetail = Prisma.GuestLeadGetPayload<{
  select: typeof guestLeadDetailSelect;
}>;

export type CreateGuestLeadInput = {
  referenceId: string;
  source?: "WHATSAPP" | "GUEST_FORM";
  status?: GuestLeadStatus;
  serviceId?: string | null;
  serviceNameEn: string;
  regionNameEn?: string | null;
  cityName?: string | null;
  fullName: string;
  phone: string;
  email?: string | null;
  vehicleInfo?: string | null;
  licenseInfo?: string | null;
  message?: string | null;
  locale: string;
  ipHash?: string | null;
  adminNotes?: string | null;
};

export type AdminUpdateGuestLeadInput = {
  id: string;
  source: "WHATSAPP" | "GUEST_FORM";
  status: GuestLeadStatus;
  serviceId?: string | null;
  serviceNameEn: string;
  regionNameEn?: string | null;
  cityName?: string | null;
  fullName: string;
  phone: string;
  email?: string | null;
  vehicleInfo?: string | null;
  licenseInfo?: string | null;
  message?: string | null;
  locale: string;
  adminNotes?: string | null;
};

export type AdminGuestLeadListFilters = {
  page?: number;
  pageSize?: number;
  status?: GuestLeadStatus;
  search?: string;
  serviceId?: string;
  source?: "WHATSAPP" | "GUEST_FORM";
  dateFrom?: Date;
  dateTo?: Date;
};

export class GuestLeadRepository extends Repository {
  async create(input: CreateGuestLeadInput): Promise<GuestLeadDetail> {
    return this.db.guestLead.create({
      data: {
        referenceId: input.referenceId,
        source: input.source ?? "GUEST_FORM",
        status: input.status ?? "NEW",
        serviceId: input.serviceId ?? null,
        serviceNameEn: input.serviceNameEn,
        regionNameEn: input.regionNameEn ?? null,
        cityName: input.cityName ?? null,
        fullName: input.fullName,
        phone: input.phone,
        email: input.email ?? null,
        vehicleInfo: input.vehicleInfo ?? null,
        licenseInfo: input.licenseInfo ?? null,
        message: input.message ?? null,
        locale: input.locale,
        ipHash: input.ipHash ?? null,
        adminNotes: input.adminNotes ?? null,
      },
      select: guestLeadDetailSelect,
    });
  }

  async findAdminById(id: string): Promise<GuestLeadDetail | null> {
    return this.query(
      () =>
        this.db.guestLead.findUnique({
          where: { id },
          select: guestLeadDetailSelect,
        }),
      null,
    );
  }

  async listAdminPaginated(filters: AdminGuestLeadListFilters = {}) {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));
    const skip = (page - 1) * pageSize;
    const search = filters.search?.trim();

    const where: Prisma.GuestLeadWhereInput = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.serviceId ? { serviceId: filters.serviceId } : {}),
      ...(filters.source ? { source: filters.source } : {}),
      ...(filters.dateFrom || filters.dateTo
        ? {
            createdAt: {
              ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters.dateTo ? { lte: filters.dateTo } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { referenceId: { contains: search, mode: "insensitive" } },
              { fullName: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { serviceNameEn: { contains: search, mode: "insensitive" } },

            ],
          }
        : {}),
    };

    return this.paginateQuery(
      ({ skip: querySkip, take }) =>
        this.db.guestLead.findMany({
          where,
          orderBy: [{ createdAt: "desc" }],
          skip: querySkip,
          take,
          select: guestLeadListSelect,
        }),
      () => this.db.guestLead.count({ where }),
      { page, pageSize },
    );
  }

  async updateAdmin(input: AdminUpdateGuestLeadInput): Promise<GuestLeadDetail> {
    const shouldMarkContacted =
      input.status === "CONTACTED" ||
      input.status === "IN_PROGRESS" ||
      input.status === "CONVERTED";

    return this.db.guestLead.update({
      where: { id: input.id },
      data: {
        source: input.source,
        status: input.status,
        serviceId: input.serviceId ?? null,
        serviceNameEn: input.serviceNameEn,
        regionNameEn: input.regionNameEn ?? null,
        cityName: input.cityName ?? null,
        fullName: input.fullName,
        phone: input.phone,
        email: input.email ?? null,
        vehicleInfo: input.vehicleInfo ?? null,
        licenseInfo: input.licenseInfo ?? null,
        message: input.message ?? null,
        locale: input.locale,
        adminNotes: input.adminNotes ?? null,
        ...(shouldMarkContacted ? { contactedAt: new Date() } : {}),
      },
      select: guestLeadDetailSelect,
    });
  }

  async deleteAdmin(id: string): Promise<void> {
    await this.db.guestLead.delete({ where: { id } });
  }

  async updateAdminStatus(input: {
    id: string;
    status: GuestLeadStatus;
    adminNotes?: string | null;
    contactedById?: string | null;
  }): Promise<GuestLeadDetail> {
    const shouldMarkContacted =
      input.status === "CONTACTED" ||
      input.status === "IN_PROGRESS" ||
      input.status === "CONVERTED";

    return this.db.guestLead.update({
      where: { id: input.id },
      data: {
        status: input.status,
        adminNotes: input.adminNotes,
        contactedById: input.contactedById ?? undefined,
        contactedAt: shouldMarkContacted ? new Date() : undefined,
      },
      select: guestLeadDetailSelect,
    });
  }

  async countByStatus(): Promise<Record<GuestLeadStatus, number>> {
    const rows = await this.query(
      () =>
        this.db.guestLead.groupBy({
          by: ["status"],
          _count: { _all: true },
        }),
      [],
    );

    const counts: Record<GuestLeadStatus, number> = {
      NEW: 0,
      CONTACTED: 0,
      IN_PROGRESS: 0,
      CONVERTED: 0,
      CLOSED: 0,
      SPAM: 0,
    };

    for (const row of rows) {
      counts[row.status] = row._count._all;
    }

    return counts;
  }
}

export const guestLeadRepository = new GuestLeadRepository();
