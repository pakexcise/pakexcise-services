import "server-only";

import type { ApplicationDraftJson } from "@/features/applications/types";
import type { WizardApplicationRecord } from "@/server/repositories/application-wizard-repository";
import { prisma } from "@/server/db/client";

export async function loadDraftDocuments(
  applicationId: string,
): Promise<ApplicationDraftJson["documents"]> {
  const documents = await prisma.document.findMany({
    where: { applicationId },
    select: {
      id: true,
      type: true,
      requirementId: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
    },
  });

  const mapped: NonNullable<ApplicationDraftJson["documents"]> = {};

  for (const document of documents) {
    if (!document.requirementId) {
      continue;
    }

    mapped[document.requirementId] = {
      documentId: document.id,
      fileName: document.fileName,
      mimeType: document.mimeType,
      fileSize: document.fileSize,
    };
  }

  return mapped;
}

export function parseDraftJson(
  draft: WizardApplicationRecord,
): {
  applicationId: string;
  trackingId: string;
  currentStep: 1 | 2 | 3 | 4;
  basic?: ApplicationDraftJson["basic"];
  fields?: ApplicationDraftJson["fields"];
} {
  const draftJson = (draft.draftJson ?? {}) as ApplicationDraftJson;
  const step = Math.min(Math.max(draft.currentStep, 1), 4) as 1 | 2 | 3 | 4;

  return {
    applicationId: draft.id,
    trackingId: draft.trackingId,
    currentStep: step,
    basic: draftJson.basic,
    fields: draftJson.fields,
  };
}
