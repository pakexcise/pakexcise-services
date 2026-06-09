import "server-only";

import type { PageContent } from "@/server/repositories/page-content-repository";
import { Repository } from "@/server/repositories/base/repository";

function pageSettingKey(pageKey: string) {
  return `page:${pageKey}`;
}

export class AdminPageContentRepository extends Repository {
  async getByPageKey(pageKey: string): Promise<PageContent | null> {
    const setting = await this.db.setting.findUnique({
      where: { key: pageSettingKey(pageKey) },
      select: { value: true },
    });

    if (!setting?.value || typeof setting.value !== "object") {
      return null;
    }

    return setting.value as PageContent;
  }

  async upsert(pageKey: string, content: PageContent) {
    return this.db.setting.upsert({
      where: { key: pageSettingKey(pageKey) },
      update: { value: content },
      create: { key: pageSettingKey(pageKey), value: content },
    });
  }
}

export const adminPageContentRepository = new AdminPageContentRepository();
