import "server-only";

import { Repository } from "@/server/repositories/base/repository";

export class ReviewRepository extends Repository {
  async listPublic(limit = 12) {
    return this.query(
      () =>
        this.db.review.findMany({
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
          take: limit,
          select: {
            id: true,
            authorNameEn: true,
            authorNameUr: true,
            authorRoleEn: true,
            authorRoleUr: true,
            contentEn: true,
            contentUr: true,
            rating: true,
          },
        }),
      [],
    );
  }
}

export const reviewRepository = new ReviewRepository();
