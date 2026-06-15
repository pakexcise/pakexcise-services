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
  ipHash: string | null;
};

export type AdminContactInquiryListFilters = {
  page?: number;
  pageSize?: number;
  status?: ContactInquiryStatus;
  query?: string;
};

export class ContactInquiryRepository extends Repository {
  async create(input: CreateContactInquiryInput): Promise<ContactInquiryDetail> {
    return this.db.contactInquiry.create({
      data: {
        referenceId: input.referenceId,
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        serviceInterest: input.serviceInterest,
        regionName: input.regionName,
        cityName: input.cityName,
        message: input.message,
        locale: input.locale,
        ipHash: input.ipHash,
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
