import "server-only";

import type { Prisma } from "@prisma/client";

import { Repository } from "@/server/repositories/base/repository";

export const adminReviewSelect = {
  id: true,
  authorNameEn: true,
  authorRoleEn: true,
  contentEn: true,
  rating: true,
  isActive: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.ReviewSelect;

export type AdminReviewItem = Prisma.ReviewGetPayload<{
  select: typeof adminReviewSelect;
}>;

export class AdminReviewRepository extends Repository {
  async listAll(): Promise<AdminReviewItem[]> {
    return this.db.review.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
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
}

export const adminReviewRepository = new AdminReviewRepository();
