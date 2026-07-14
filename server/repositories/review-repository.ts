import "server-only";

import type { Prisma } from "@prisma/client";

import { Repository } from "@/server/repositories/base/repository";

export const publicReviewSelect = {
  id: true,
  authorNameEn: true,
  authorRoleEn: true,
  contentEn: true,
  rating: true,
  source: true,
  submittedAt: true,
  service: {
    select: {
      id: true,
      nameEn: true,
      slug: true,
    },
  },
} as const satisfies Prisma.ReviewSelect;

export type PublicReview = Prisma.ReviewGetPayload<{
  select: typeof publicReviewSelect;
}>;

const approvedPublicWhere: Prisma.ReviewWhereInput = {
  status: "APPROVED",
  isActive: true,
};

export class ReviewRepository extends Repository {
  async listPublic(limit = 24): Promise<PublicReview[]> {
    return this.query(
      () =>
        this.db.review.findMany({
          where: approvedPublicWhere,
          orderBy: [{ displayOrder: "asc" }, { submittedAt: "desc" }],
          take: limit,
          select: publicReviewSelect,
        }),
      [],
    );
  }

  async listPublicForService(serviceId: string, limit = 6): Promise<PublicReview[]> {
    return this.query(
      () =>
        this.db.review.findMany({
          where: {
            ...approvedPublicWhere,
            serviceId,
          },
          orderBy: [{ displayOrder: "asc" }, { submittedAt: "desc" }],
          take: limit,
          select: publicReviewSelect,
        }),
      [],
    );
  }

  async getPublicSummary(serviceId?: string) {
    const where: Prisma.ReviewWhereInput = {
      ...approvedPublicWhere,
      ...(serviceId ? { serviceId } : {}),
    };

    const [count, aggregate] = await Promise.all([
      this.db.review.count({ where }),
      this.db.review.aggregate({
        where,
        _avg: { rating: true },
      }),
    ]);

    return {
      count,
      averageRating: aggregate._avg.rating ?? 0,
    };
  }

  async listEligibleApplicationsForCustomer(userId: string) {
    return this.db.application.findMany({
      where: {
        userId,
        status: "COMPLETED",
        review: null,
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        trackingId: true,
        service: {
          select: {
            id: true,
            nameEn: true,
            slug: true,
          },
        },
      },
    });
  }
}

export const reviewRepository = new ReviewRepository();
