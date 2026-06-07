import "server-only";

import { Repository } from "@/server/repositories/base/repository";

export class SeoMetaRepository extends Repository {
  async findByPageKey(pageKey: string) {
    return this.query(
      () =>
        this.db.seoMeta.findUnique({
          where: { pageKey },
        }),
      null,
    );
  }

  async findByServiceId(serviceId: string) {
    return this.query(
      () =>
        this.db.seoMeta.findUnique({
          where: { serviceId },
        }),
      null,
    );
  }

  async findByRegionId(regionId: string) {
    return this.query(
      () =>
        this.db.seoMeta.findUnique({
          where: { regionId },
        }),
      null,
    );
  }
}

export const seoMetaRepository = new SeoMetaRepository();
