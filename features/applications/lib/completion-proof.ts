import "server-only";

import { COMPLETION_PROOF_DOC_TYPE } from "@/config/uploads";
import { prisma } from "@/server/db/client";
import { deleteStoredObject, headStoredObject } from "@/server/storage/object-storage";

type CompletionProofRecord = {
  id: string;
  r2Key: string;
  fileName: string;
  checksum: string | null;
  fileSize: number;
};

export function isUploadedCompletionProof(
  proof: Pick<CompletionProofRecord, "checksum" | "fileSize"> | null | undefined,
): boolean {
  return Boolean(proof?.checksum && proof.fileSize > 0);
}

export async function findUploadedCompletionProof(
  applicationId: string,
): Promise<CompletionProofRecord | null> {
  return prisma.document.findFirst({
    where: {
      applicationId,
      type: COMPLETION_PROOF_DOC_TYPE,
      checksum: { not: null },
    },
    select: {
      id: true,
      r2Key: true,
      fileName: true,
      checksum: true,
      fileSize: true,
    },
  });
}

export async function hasUploadedCompletionProof(
  applicationId: string,
): Promise<boolean> {
  const proof = await findUploadedCompletionProof(applicationId);

  if (!isUploadedCompletionProof(proof)) {
    return false;
  }

  const head = await headStoredObject(proof!.r2Key);
  return Boolean(head?.contentLength);
}

export async function clearCompletionProofDocuments(
  applicationId: string,
): Promise<void> {
  const documents = await prisma.document.findMany({
    where: {
      applicationId,
      type: COMPLETION_PROOF_DOC_TYPE,
    },
    select: {
      id: true,
      r2Key: true,
    },
  });

  await Promise.all(
    documents.map(async (document) => {
      try {
        await deleteStoredObject(document.r2Key);
      } catch {
        // Best-effort storage cleanup; DB row is still removed below.
      }
    }),
  );

  await prisma.document.deleteMany({
    where: {
      applicationId,
      type: COMPLETION_PROOF_DOC_TYPE,
    },
  });
}
