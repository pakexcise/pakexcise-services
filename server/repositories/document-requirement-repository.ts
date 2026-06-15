import "server-only";

import { activeOnly, Repository } from "@/server/repositories/base/repository";
import { publicTopLevelServiceWhere } from "@/server/repositories/service-repository";

const publicDocumentPreviewSelect = {
  id: true,
  docType: true,
  labelEn: true,
  labelUr: true,
  isRequired: true,
  displayOrder: true,
  service: {
    select: {
      slug: true,
      nameEn: true,
      nameUr: true,
    },
  },
} as const;

export type PublicDocumentPreview = {
  id: string;
  docType: string;
  labelEn: string;
  labelUr: string;
  isRequired: boolean;
  displayOrder: number;
  service: {
    slug: string;
    nameEn: string;
    nameUr: string;
  };
};

export class DocumentRequirementRepository extends Repository {
  async listPublicPreview(limit = 8): Promise<PublicDocumentPreview[]> {
    return this.query(async () => {
      const rows = await this.db.documentRequirement.findMany({
        where: {
          isActive: true,
          service: publicTopLevelServiceWhere,
        },
        orderBy: [{ displayOrder: "asc" }, { labelEn: "asc" }],
        select: publicDocumentPreviewSelect,
        take: 80,
      });

      const seen = new Set<string>();
      const unique: PublicDocumentPreview[] = [];

      for (const row of rows) {
        const key = `${row.docType}:${row.labelEn.toLowerCase()}`;
        if (seen.has(key)) {
          continue;
        }

        seen.add(key);
        unique.push(row);

        if (unique.length >= limit) {
          break;
        }
      }

      return unique;
    }, []);
  }
}

export const documentRequirementRepository = new DocumentRequirementRepository();
