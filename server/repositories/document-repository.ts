import "server-only";

import type { DocumentStatus, Prisma } from "@prisma/client";

import { Repository } from "@/server/repositories/base/repository";

const documentWithApplicationSelect = {
  id: true,
  applicationId: true,
  requirementId: true,
  uploadedById: true,
  type: true,
  r2Key: true,
  fileName: true,
  mimeType: true,
  fileSize: true,
  checksum: true,
  status: true,
  rejectionReason: true,
  verifiedById: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
  application: {
    select: {
      id: true,
      userId: true,
      agentId: true,
      status: true,
      serviceId: true,
    },
  },
} as const satisfies Prisma.DocumentSelect;

export type DocumentWithApplication = Prisma.DocumentGetPayload<{
  select: typeof documentWithApplicationSelect;
}>;

export class DocumentRepository extends Repository {
  async findByIdWithApplication(
    documentId: string,
  ): Promise<DocumentWithApplication | null> {
    return this.db.document.findUnique({
      where: { id: documentId },
      select: documentWithApplicationSelect,
    });
  }

  async createPending(input: {
    applicationId: string;
    requirementId?: string | null;
    uploadedById: string;
    type: string;
    r2Key: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  }) {
    return this.db.document.create({
      data: {
        applicationId: input.applicationId,
        requirementId: input.requirementId ?? null,
        uploadedById: input.uploadedById,
        type: input.type,
        r2Key: input.r2Key,
        fileName: input.fileName,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        status: "PENDING",
      },
    });
  }

  async updateAfterUpload(input: {
    documentId: string;
    fileSize: number;
    checksum?: string | null;
  }) {
    return this.db.document.update({
      where: { id: input.documentId },
      data: {
        fileSize: input.fileSize,
        checksum: input.checksum ?? null,
      },
    });
  }

  async setStatus(input: {
    documentId: string;
    status: DocumentStatus;
    verifiedById?: string | null;
    rejectionReason?: string | null;
  }) {
    return this.db.document.update({
      where: { id: input.documentId },
      data: {
        status: input.status,
        verifiedById: input.verifiedById ?? null,
        verifiedAt: input.verifiedById ? new Date() : null,
        rejectionReason: input.rejectionReason ?? null,
      },
    });
  }

  async deleteById(documentId: string): Promise<void> {
    await this.db.document.delete({ where: { id: documentId } });
  }

  async deletePendingForRequirement(input: {
    applicationId: string;
    requirementId: string;
  }): Promise<void> {
    await this.db.document.deleteMany({
      where: {
        applicationId: input.applicationId,
        requirementId: input.requirementId,
        status: "PENDING",
      },
    });
  }
}

export const documentRepository = new DocumentRepository();
