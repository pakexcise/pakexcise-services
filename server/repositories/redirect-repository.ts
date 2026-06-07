import "server-only";

import { Repository } from "@/server/repositories/base/repository";

export class RedirectRepository extends Repository {
  async findActiveByOldSlug(oldSlug: string) {
    return this.db.redirect.findFirst({
      where: {
        oldSlug,
        isActive: true,
      },
    });
  }
}

export const redirectRepository = new RedirectRepository();
