import "server-only";

import { Repository } from "@/server/repositories/base/repository";

const publicSocialLinkSelect = {
  id: true,
  platform: true,
  labelEn: true,
  labelUr: true,
  url: true,
  iconName: true,
  displayOrder: true,
} as const;

export class SocialLinkRepository extends Repository {
  async listPublic() {
    return this.query(
      () =>
        this.db.socialLink.findMany({
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
          select: publicSocialLinkSelect,
        }),
      [],
    );
  }
}

export const socialLinkRepository = new SocialLinkRepository();

export async function getActiveSocialLinks() {
  return socialLinkRepository.listPublic();
}
