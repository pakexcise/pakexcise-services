import "server-only";

import type { Prisma } from "@prisma/client";

import { Repository } from "@/server/repositories/base/repository";

export const adminSocialLinkSelect = {
  id: true,
  platform: true,
  labelEn: true,
  labelUr: true,
  url: true,
  iconName: true,
  isActive: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.SocialLinkSelect;

export type AdminSocialLinkItem = Prisma.SocialLinkGetPayload<{
  select: typeof adminSocialLinkSelect;
}>;

export class AdminSocialRepository extends Repository {
  async listAll(): Promise<AdminSocialLinkItem[]> {
    return this.db.socialLink.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      select: adminSocialLinkSelect,
    });
  }

  async findById(id: string): Promise<AdminSocialLinkItem | null> {
    return this.db.socialLink.findUnique({
      where: { id },
      select: adminSocialLinkSelect,
    });
  }

  async getNextDisplayOrder(): Promise<number> {
    const last = await this.db.socialLink.findFirst({
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });

    return (last?.displayOrder ?? 0) + 1;
  }
}

export const adminSocialRepository = new AdminSocialRepository();
