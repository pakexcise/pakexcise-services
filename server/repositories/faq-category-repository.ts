import "server-only";

import { Repository } from "@/server/repositories/base/repository";

const publicFaqCategorySelect = {
  id: true,
  slug: true,
  nameEn: true,
  descriptionEn: true,
  displayOrder: true} as const;

export type PublicFaqCategory = {
  id: string;
  slug: string;
  nameEn: string;
  descriptionEn: string | null;
  displayOrder: number;
};

export class FaqCategoryRepository extends Repository {
  async listActivePublic(): Promise<PublicFaqCategory[]> {
    return this.query(
      () =>
        this.db.faqCategory.findMany({
          where: { isActive: true },
          orderBy: [{ displayOrder: "asc" }, { nameEn: "asc" }],
          select: publicFaqCategorySelect}),
      [],
    );
  }
}

export const faqCategoryRepository = new FaqCategoryRepository();
