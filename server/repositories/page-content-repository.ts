import "server-only";

import { Repository } from "@/server/repositories/base/repository";

export type PageContent = {
  titleEn: string;
  contentEn: string;
  excerptEn?: string;
};

export class PageContentRepository extends Repository {
  async getByPageKey(pageKey: string): Promise<PageContent | null> {
    return this.query(async () => {
      const setting = await this.db.setting.findUnique({
        where: { key: `page:${pageKey}` },
        select: { value: true }});

      if (!setting?.value || typeof setting.value !== "object") {
        return null;
      }

      return setting.value as PageContent;
    }, null);
  }
}

export const pageContentRepository = new PageContentRepository();

export async function getPageContent(
  pageKey: string,
): Promise<PageContent | null> {
  return pageContentRepository.getByPageKey(pageKey);
}
