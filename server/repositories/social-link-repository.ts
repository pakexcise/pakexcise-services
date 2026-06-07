import "server-only";

import { activeOnly, Repository } from "@/server/repositories/base/repository";

export class SocialLinkRepository extends Repository {
  async listPublic() {
    return this.db.socialLink.findMany({
      where: activeOnly(),
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        platform: true,
        labelEn: true,
        labelUr: true,
        url: true,
        displayOrder: true,
      },
    });
  }
}

export const socialLinkRepository = new SocialLinkRepository();

export async function getActiveSocialLinks() {
  return socialLinkRepository.listPublic();
}
