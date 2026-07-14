import "server-only";

import type { Prisma, ReviewSource, ReviewStatus } from "@prisma/client";

import { Repository } from "@/server/repositories/base/repository";

export const adminReviewSelect = {
  id: true,
  authorNameEn: true,
  authorRoleEn: true,
  contentEn: true,
  rating: true,
  status: true,
  source: true,
  isActive: true,
  displayOrder: true,
  customerConsent: true,
  moderationNote: true,
  moderatedAt: true,
  submittedAt: true,
  externalId: true,
  externalUpdatedAt: true,
  userId: true,
  applicationId: true,
  serviceId: true,
  moderatedById: true,
  createdAt: true,
  updatedAt: true,
  service: {
    select: {
      id: true,
      nameEn: true,
      slug: true,
    },
  },
  application: {
    select: {
      id: true,
      trackingId: true,
      status: true,
    },
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const satisfies Prisma.ReviewSelect;

export type AdminReviewItem = Prisma.ReviewGetPayload<{
  select: typeof adminReviewSelect;
}>;

export type AdminReviewListFilters = {
  query?: string;
  status?: ReviewStatus | "ALL";
  source?: ReviewSource | "ALL";
};

export class AdminReviewRepository extends Repository {
  async listAll(filters: AdminReviewListFilters = {}): Promise<AdminReviewItem[]> {
    const where: Prisma.ReviewWhereInput = {};

    if (filters.status && filters.status !== "ALL") {
      where.status = filters.status;
    }

    if (filters.source && filters.source !== "ALL") {
      where.source = filters.source;
    }

    const query = filters.query?.trim();
    if (query) {
      where.OR = [
        { authorNameEn: { contains: query, mode: "insensitive" } },
        { authorRoleEn: { contains: query, mode: "insensitive" } },
        { contentEn: { contains: query, mode: "insensitive" } },
        { service: { nameEn: { contains: query, mode: "insensitive" } } },
        { application: { trackingId: { contains: query, mode: "insensitive" } } },
      ];
    }

    return this.db.review.findMany({
      where,
      orderBy: [
        { status: "asc" },
        { displayOrder: "asc" },
        { submittedAt: "desc" },
      ],
      select: adminReviewSelect,
    });
  }

  async findById(id: string): Promise<AdminReviewItem | null> {
    return this.db.review.findUnique({
      where: { id },
      select: adminReviewSelect,
    });
  }

  async getNextDisplayOrder(): Promise<number> {
    const last = await this.db.review.findFirst({
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });

    return (last?.displayOrder ?? 0) + 1;
  }

  async countByStatus(status: ReviewStatus): Promise<number> {
    return this.db.review.count({ where: { status } });
  }
}

export const adminReviewRepository = new AdminReviewRepository();
