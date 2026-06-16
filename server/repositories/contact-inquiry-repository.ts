import type { ContactInquiryStatus, Prisma } from "@prisma/client";

import { Repository } from "@/server/repositories/base/repository";

const contactInquiryListSelect = {
  id: true,
  referenceId: true,
  status: true,
  fullName: true,
  phone: true,
  email: true,
  serviceInterest: true,
  regionName: true,
  cityName: true,
  createdAt: true,
} as const satisfies Prisma.ContactInquirySelect;

const contactInquiryDetailSelect = {
  ...contactInquiryListSelect,
  message: true,
  locale: true,
  adminNotes: true,
  contactedAt: true,
  contactedById: true,
  updatedAt: true,
  contactedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const satisfies Prisma.ContactInquirySelect;

export type ContactInquiryListItem = Prisma.ContactInquiryGetPayload<{
  select: typeof contactInquiryListSelect;
}>;

export type ContactInquiryDetail = Prisma.ContactInquiryGetPayload<{
  select: typeof contactInquiryDetailSelect;
}>;

export type CreateContactInquiryInput = {
  referenceId: string;
  fullName: string;
  phone: string;
  email: string | null;
  serviceInterest: string;
  regionName: string | null;
  cityName: string | null;
  message: string | null;
  locale: string;
  ipHash?: string | null;
  status?: ContactInquiryStatus;
  adminNotes?: string | null;
};

export type AdminUpdateContactInquiryInput = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  serviceInterest: string;
  regionName: string | null;
  cityName: string | null;
  message: string | null;
  locale: string;
  status: ContactInquiryStatus;
  adminNotes: string | null;
};

export type AdminContactInquiryListFilters = {
  page?: number;
  pageSize?: number;
  status?: ContactInquiryStatus;
  query?: string;
  serviceInterest?: string;
  dateFrom?: Date;
  dateTo?: Date;
};

export class ContactInquiryRepository extends Repository {
  async create(input: CreateContactInquiryInput): Promise<ContactInquiryDetail> {
    return this.db.contactInquiry.create({
      data: {
        referenceId: input.referenceId,
        status: input.status ?? "NEW",
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        serviceInterest: input.serviceInterest,
        regionName: input.regionName,
        cityName: input.cityName,
        message: input.message,
        locale: input.locale,
        ipHash: input.ipHash ?? null,
        adminNotes: input.adminNotes ?? null,
      },
      select: contactInquiryDetailSelect,
    });
  }

  async findAdminById(id: string): Promise<ContactInquiryDetail | null> {
    return this.query(
      () =>
        this.db.contactInquiry.findUnique({
          where: { id },
          select: contactInquiryDetailSelect,
        }),
      null,
    );
  }

  async listAdminPaginated(filters: AdminContactInquiryListFilters = {}) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ContactInquiryWhereInput = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.serviceInterest
        ? { serviceInterest: filters.serviceInterest }
        : {}),
      ...(filters.dateFrom || filters.dateTo
        ? {
            createdAt: {
              ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
              ...(filters.dateTo ? { lte: filters.dateTo } : {}),
            },
          }
        : {}),
      ...(filters.query
        ? {
            OR: [
              { referenceId: { contains: filters.query, mode: "insensitive" } },
              { fullName: { contains: filters.query, mode: "insensitive" } },
              { phone: { contains: filters.query, mode: "insensitive" } },
              { email: { contains: filters.query, mode: "insensitive" } },
              { serviceInterest: { contains: filters.query, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.query(
        () =>
          this.db.contactInquiry.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize,
            select: contactInquiryListSelect,
          }),
        [],
      ),
      this.query(() => this.db.contactInquiry.count({ where }), 0),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async listRecent(limit = 8): Promise<ContactInquiryListItem[]> {
    return this.query(
      () =>
        this.db.contactInquiry.findMany({
          orderBy: { createdAt: "desc" },
          take: limit,
          select: contactInquiryListSelect,
        }),
      [],
    );
  }

  async updateAdmin(input: AdminUpdateContactInquiryInput): Promise<ContactInquiryDetail> {
    const contactedAt = input.status === "CONTACTED" ? new Date() : undefined;

    return this.db.contactInquiry.update({
      where: { id: input.id },
      data: {
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        serviceInterest: input.serviceInterest,
        regionName: input.regionName,
        cityName: input.cityName,
        message: input.message,
        locale: input.locale,
        status: input.status,
        adminNotes: input.adminNotes,
        ...(contactedAt ? { contactedAt } : {}),
      },
      select: contactInquiryDetailSelect,
    });
  }

  async deleteAdmin(id: string): Promise<void> {
    await this.db.contactInquiry.delete({ where: { id } });
  }

  async countByStatus(): Promise<Record<ContactInquiryStatus, number>> {
    const rows = await this.query(
      () =>
        this.db.contactInquiry.groupBy({
          by: ["status"],
          _count: { _all: true },
        }),
      [],
    );

    const counts: Record<ContactInquiryStatus, number> = {
      NEW: 0,
      CONTACTED: 0,
      CLOSED: 0,
      SPAM: 0,
    };

    for (const row of rows) {
      counts[row.status] = row._count._all;
    }

    return counts;
  }

  async updateAdminStatus(input: {
    id: string;
    status: ContactInquiryStatus;
    adminNotes?: string | null;
    contactedById?: string | null;
  }): Promise<ContactInquiryDetail> {
    const contactedAt =
      input.status === "CONTACTED" && input.contactedById ? new Date() : undefined;

    return this.db.contactInquiry.update({
      where: { id: input.id },
      data: {
        status: input.status,
        adminNotes: input.adminNotes ?? undefined,
        contactedById: input.contactedById ?? undefined,
        ...(contactedAt ? { contactedAt } : {}),
      },
      select: contactInquiryDetailSelect,
    });
  }
}

export const contactInquiryRepository = new ContactInquiryRepository();
