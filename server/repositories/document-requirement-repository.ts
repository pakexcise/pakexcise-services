import "server-only";

import type { DocumentRequirementKind } from "@prisma/client";

import { Repository } from "@/server/repositories/base/repository";
import { publicTopLevelServiceWhere } from "@/server/repositories/service-repository";

const publicDocumentPreviewSelect = {
  id: true,
  docType: true,
  labelEn: true,
  isRequired: true,
  displayOrder: true,
  service: {
    select: {
      slug: true,
      nameEn: true,
    },
  },
} as const;

export type PublicDocumentPreview = {
  id: string;
  docType: string;
  labelEn: string;
  isRequired: boolean;
  displayOrder: number;
  service: {
    slug: string;
    nameEn: string;
  };
};

export type PublicDocumentHubItem = {
  id: string;
  labelEn: string;
  isRequired: boolean;
  kind: DocumentRequirementKind;
  instructionsEn: string | null;
};

export type PublicDocumentHubRegionGroup = {
  regionKey: string;
  regionLabel: string;
  items: PublicDocumentHubItem[];
};

export type PublicDocumentHubGroup = {
  service: {
    slug: string;
    nameEn: string;
  };
  regions: PublicDocumentHubRegionGroup[];
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

  async listPublicGroupedByService(): Promise<PublicDocumentHubGroup[]> {
    return this.query(async () => {
      const rows = await this.db.documentRequirement.findMany({
        where: {
          isActive: true,
          service: publicTopLevelServiceWhere,
        },
        orderBy: [
          { service: { displayOrder: "asc" } },
          { region: { displayOrder: "asc" } },
          { displayOrder: "asc" },
          { labelEn: "asc" },
        ],
        select: {
          id: true,
          labelEn: true,
          isRequired: true,
          kind: true,
          instructionsEn: true,
          region: {
            select: {
              slug: true,
              nameEn: true,
              displayOrder: true,
            },
          },
          service: {
            select: {
              slug: true,
              nameEn: true,
              displayOrder: true,
            },
          },
        },
      });

      const serviceMap = new Map<string, PublicDocumentHubGroup>();

      for (const row of rows) {
        const serviceSlug = row.service.slug;
        let serviceGroup = serviceMap.get(serviceSlug);

        if (!serviceGroup) {
          serviceGroup = {
            service: {
              slug: row.service.slug,
              nameEn: row.service.nameEn,
            },
            regions: [],
          };
          serviceMap.set(serviceSlug, serviceGroup);
        }

        const regionKey = row.region?.slug ?? "all-regions";
        const regionLabel = row.region?.nameEn ?? "All provinces";
        let regionGroup = serviceGroup.regions.find(
          (group) => group.regionKey === regionKey,
        );

        if (!regionGroup) {
          regionGroup = {
            regionKey,
            regionLabel,
            items: [],
          };
          serviceGroup.regions.push(regionGroup);
        }

        regionGroup.items.push({
          id: row.id,
          labelEn: row.labelEn,
          isRequired: row.isRequired,
          kind: row.kind,
          instructionsEn: row.instructionsEn,
        });
      }

      return Array.from(serviceMap.values());
    }, []);
  }
}

export const documentRequirementRepository = new DocumentRequirementRepository();
