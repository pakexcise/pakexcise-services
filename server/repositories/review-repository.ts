import "server-only";

import type { Prisma } from "@prisma/client";

import {
  Repository,
  type PaginatedResult,
} from "@/server/repositories/base/repository";

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

  async listPublicFeatured(limit = 6): Promise<PublicReview[]> {
    const [googleReviews, otherReviews] = await Promise.all([
      this.query(
        () =>
          this.db.review.findMany({
            where: { ...approvedPublicWhere, source: "GOOGLE" },
            orderBy: [{ submittedAt: "desc" }, { displayOrder: "asc" }],
            take: limit,
            select: publicReviewSelect,
          }),
        [],
      ),
      this.query(
        () =>
          this.db.review.findMany({
            where: { ...approvedPublicWhere, source: { not: "GOOGLE" } },
            orderBy: [{ displayOrder: "asc" }, { submittedAt: "desc" }],
            take: limit,
            select: publicReviewSelect,
          }),
        [],
      ),
    ]);

    const merged: PublicReview[] = [];
    const seen = new Set<string>();

    for (const review of [...googleReviews, ...otherReviews]) {
      if (seen.has(review.id)) continue;
      seen.add(review.id);
      merged.push(review);
      if (merged.length >= limit) break;
    }

    return merged;
  }

  async listPublicPaginated(
    page = 1,
    pageSize = 6,
  ): Promise<PaginatedResult<PublicReview>> {
    return this.paginateQuery(
      ({ skip, take }) =>
        this.db.review.findMany({
          where: approvedPublicWhere,
          orderBy: [{ displayOrder: "asc" }, { submittedAt: "desc" }],
          skip,
          take,
          select: publicReviewSelect,
        }),
      () => this.db.review.count({ where: approvedPublicWhere }),
      { page, pageSize },
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

  async listPublicForServices(
    serviceIds: string[],
    limit = 6,
  ): Promise<PublicReview[]> {
    if (serviceIds.length === 0) {
      return [];
    }

    return this.query(
      () =>
        this.db.review.findMany({
          where: {
            ...approvedPublicWhere,
            serviceId: { in: serviceIds },
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

  async getPublicSummaryForServices(serviceIds: string[]) {
    if (serviceIds.length === 0) {
      return { count: 0, averageRating: 0 };
    }

    const where: Prisma.ReviewWhereInput = {
      ...approvedPublicWhere,
      serviceId: { in: serviceIds },
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
