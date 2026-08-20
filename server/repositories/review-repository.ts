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
  moderatedAt: true,
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

export function isPublishablePublicReview(review: PublicReview): boolean {
  return Boolean(review.authorNameEn?.trim() && review.contentEn?.trim() && review.rating > 0);
}

function keepPublishable(reviews: PublicReview[]): PublicReview[] {
  return reviews.filter(isPublishablePublicReview);
}

const approvedPublicWhere: Prisma.ReviewWhereInput = {
  status: "APPROVED",
  isActive: true,
  authorNameEn: { not: "" },
  contentEn: { not: "" },
  rating: { gt: 0 },
};

/** Newest published reviews first (matches relative dates on review cards). */
const publicLatestOrderBy: Prisma.ReviewOrderByWithRelationInput[] = [
  { moderatedAt: "desc" },
  { submittedAt: "desc" },
  { createdAt: "desc" },
];

export class ReviewRepository extends Repository {
  async listPublic(limit = 24): Promise<PublicReview[]> {
    return this.query(
      () =>
        this.db.review.findMany({
          where: approvedPublicWhere,
          orderBy: publicLatestOrderBy,
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
            orderBy: publicLatestOrderBy,
            take: limit,
            select: publicReviewSelect,
          }),
        [],
      ),
      this.query(
        () =>
          this.db.review.findMany({
            where: { ...approvedPublicWhere, source: { not: "GOOGLE" } },
            orderBy: publicLatestOrderBy,
            take: limit,
            select: publicReviewSelect,
          }),
        [],
      ),
    ]);

    const merged: PublicReview[] = [];
    const seen = new Set<string>();

    for (const review of keepPublishable([...googleReviews, ...otherReviews])) {
      if (seen.has(review.id)) continue;
      seen.add(review.id);
      merged.push(review);
      if (merged.length >= limit) break;
    }

    // Keep featured homepage strip newest-first after merge.
    return merged.sort((a, b) => {
      const aTime = new Date(a.moderatedAt ?? a.submittedAt).getTime();
      const bTime = new Date(b.moderatedAt ?? b.submittedAt).getTime();
      return bTime - aTime;
    });
  }

  async listPublicPaginated(
    page = 1,
    pageSize = 6,
  ): Promise<PaginatedResult<PublicReview>> {
    return this.paginateQuery(
      ({ skip, take }) =>
        this.db.review.findMany({
          where: approvedPublicWhere,
          orderBy: publicLatestOrderBy,
          skip,
          take,
          select: publicReviewSelect,
        }),
      () => this.db.review.count({ where: approvedPublicWhere }),
      { page, pageSize },
    ).then((result) => ({
      ...result,
      items: keepPublishable(result.items),
    }));
  }

  async listPublicForService(serviceId: string, limit = 6): Promise<PublicReview[]> {
    return this.query(
      () =>
        this.db.review.findMany({
          where: {
            ...approvedPublicWhere,
            serviceId,
          },
          orderBy: publicLatestOrderBy,
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
          orderBy: publicLatestOrderBy,
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
