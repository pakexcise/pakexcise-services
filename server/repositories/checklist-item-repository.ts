import "server-only";

import type { Prisma } from "@prisma/client";

import { Repository } from "@/server/repositories/base/repository";

const checklistItemSelect = {
  id: true,
  slug: true,
  nameEn: true,
  nameUr: true,
  descriptionEn: true,
  descriptionUr: true,
  itemType: true,
  isActive: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.ChecklistItemSelect;

export type AdminChecklistItem = Prisma.ChecklistItemGetPayload<{
  select: typeof checklistItemSelect;
}>;

export class ChecklistItemRepository extends Repository {
  async listAdmin(): Promise<AdminChecklistItem[]> {
    return this.query(
      () =>
        this.db.checklistItem.findMany({
          orderBy: [{ displayOrder: "asc" }, { nameEn: "asc" }],
          select: checklistItemSelect,
        }),
      [],
    );
  }

  async listActive(): Promise<AdminChecklistItem[]> {
    return this.query(
      () =>
        this.db.checklistItem.findMany({
          where: { isActive: true },
          orderBy: [{ displayOrder: "asc" }, { nameEn: "asc" }],
          select: checklistItemSelect,
        }),
      [],
    );
  }
}

export const checklistItemRepository = new ChecklistItemRepository();
