import "server-only";

import { activeOnly, paginate, Repository } from "@/server/repositories/base/repository";

export class FaqRepository extends Repository {
  async listPublic() {
    return this.db.fAQ.findMany({
      where: activeOnly(),
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        questionEn: true,
        questionUr: true,
        answerEn: true,
        answerUr: true,
        displayOrder: true,
      },
    });
  }

  async listPublicPaginated(page = 1, pageSize = 20) {
    const where = activeOnly();

    return paginate(
      ({ skip, take }) =>
        this.db.fAQ.findMany({
          where,
          orderBy: { displayOrder: "asc" },
          skip,
          take,
          select: {
            id: true,
            questionEn: true,
            questionUr: true,
            answerEn: true,
            answerUr: true,
            displayOrder: true,
          },
        }),
      () => this.db.fAQ.count({ where }),
      { page, pageSize },
    );
  }
}

export const faqRepository = new FaqRepository();
