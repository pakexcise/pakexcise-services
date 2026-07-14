import "server-only";

import { Repository } from "@/server/repositories/base/repository";

export class ReviewRepository extends Repository {
  async listPublic(limit = 24) {
    return this.query(
      () =>
        this.db.review.findMany({
          where: { isActive: true },
          orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
          take: limit,
          select: {
            id: true,
            authorNameEn: true,
            authorRoleEn: true,
            contentEn: true,
            rating: true,
          },
        }),
      [],
    );
  }
}

export const reviewRepository = new ReviewRepository();
