import "server-only";

import type { ApplicationStatus, Prisma } from "@prisma/client";

import { COMPLETION_PROOF_DOC_TYPE } from "@/config/uploads";
import { Repository } from "@/server/repositories/base/repository";

const customerApplicationListSelect = {
  id: true,
  trackingId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  service: {
    select: {
      slug: true,
      nameEn: true,
      nameUr: true,
    },
  },
  invoices: {
    where: { status: "SENT" },
    orderBy: { sentAt: "desc" },
    take: 1,
    select: {
      id: true,
      invoiceNumber: true,
      total: true,
      sentAt: true,
    },
  },
  payments: {
    orderBy: { createdAt: "desc" },
    take: 1,
    select: {
      id: true,
      status: true,
    },
  },
  documents: {
    where: { type: COMPLETION_PROOF_DOC_TYPE },
    take: 1,
    select: { id: true },
  },
} as const satisfies Prisma.ApplicationSelect;

export type CustomerApplicationListItem = Prisma.ApplicationGetPayload<{
  select: typeof customerApplicationListSelect;
}>;

const customerApplicationDetailSelect = {
  id: true,
  trackingId: true,
  status: true,
  locale: true,
  createdAt: true,
  updatedAt: true,
  service: {
    select: {
      nameEn: true,
      nameUr: true,
      slug: true,
      requiresProof: true,
      documentReqs: {
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          docType: true,
          labelEn: true,
          labelUr: true,
          instructionsEn: true,
          instructionsUr: true,
          isRequired: true,
          maxSizeBytes: true,
          acceptedMimeTypes: true,
        },
      },
    },
  },
  fieldValues: {
    orderBy: { createdAt: "asc" },
    select: {
      fieldId: true,
      valuePlain: true,
      valueEncrypted: true,
      valueJson: true,
      isEncrypted: true,
      field: {
        select: {
          fieldKey: true,
          labelEn: true,
          labelUr: true,
          fieldType: true,
          isEncrypted: true,
        },
      },
    },
  },
  documents: {
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      type: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
      status: true,
      rejectionReason: true,
      requirementId: true,
      createdAt: true,
      requirement: {
        select: {
          labelEn: true,
          labelUr: true,
          isRequired: true,
        },
      },
    },
  },
  statusHistory: {
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      fromStatus: true,
      toStatus: true,
      createdAt: true,
    },
  },
} as const satisfies Prisma.ApplicationSelect;

export type CustomerApplicationDetail = Prisma.ApplicationGetPayload<{
  select: typeof customerApplicationDetailSelect;
}>;

const publicTrackSelect = {
  trackingId: true,
  status: true,
  updatedAt: true,
  service: {
    select: {
      nameEn: true,
      nameUr: true,
    },
  },
} as const satisfies Prisma.ApplicationSelect;

export type PublicTrackApplication = Prisma.ApplicationGetPayload<{
  select: typeof publicTrackSelect;
}>;

export type CustomerApplicationStatusCounts = {
  total: number;
  actionRequired: number;
  inProgress: number;
  completed: number;
  closed: number;
};

export class CustomerApplicationRepository extends Repository {
  async listForUser(userId: string): Promise<CustomerApplicationListItem[]> {
    return this.db.application.findMany({
      where: {
        userId,
        status: { not: "DRAFT" },
      },
      orderBy: { updatedAt: "desc" },
      select: customerApplicationListSelect,
    });
  }

  async getStatusCountsForUser(
    userId: string,
  ): Promise<CustomerApplicationStatusCounts> {
    const rows = await this.db.application.findMany({
      where: {
        userId,
        status: { not: "DRAFT" },
      },
      select: { status: true },
    });

    const counts: CustomerApplicationStatusCounts = {
      total: rows.length,
      actionRequired: 0,
      inProgress: 0,
      completed: 0,
      closed: 0,
    };

    const actionRequired: ApplicationStatus[] = ["DOCS_REQUIRED", "INVOICE_SENT"];
    const inProgress: ApplicationStatus[] = [
      "SUBMITTED",
      "REVIEW",
      "PAYMENT_UPLOADED",
      "PAYMENT_VERIFIED",
      "IN_PROGRESS",
      "AT_OFFICE",
    ];
    const closed: ApplicationStatus[] = ["REJECTED", "CANCELLED"];

    for (const row of rows) {
      if (actionRequired.includes(row.status)) {
        counts.actionRequired += 1;
      } else if (row.status === "COMPLETED") {
        counts.completed += 1;
      } else if (closed.includes(row.status)) {
        counts.closed += 1;
      } else if (inProgress.includes(row.status)) {
        counts.inProgress += 1;
      }
    }

    return counts;
  }

  async findOwnedById(input: { id: string; userId: string }) {
    return this.db.application.findFirst({
      where: {
        id: input.id,
        userId: input.userId,
        status: { not: "DRAFT" },
      },
      select: customerApplicationDetailSelect,
    });
  }

  async findPublicByTrackingId(
    trackingId: string,
  ): Promise<PublicTrackApplication | null> {
    return this.db.application.findFirst({
      where: {
        trackingId,
        status: { not: "DRAFT" },
      },
      select: publicTrackSelect,
    });
  }
}

export const customerApplicationRepository =
  new CustomerApplicationRepository();
