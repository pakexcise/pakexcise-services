"use server";

import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import {
  confirmDocumentUploadSchema,
  requestDocumentUploadSchema,
} from "@/lib/validations/application";
import {
  handleConfirmUpload,
  handlePresignUpload,
} from "@/features/documents/lib/handlers";
import { requireApplyAccess } from "@/server/permissions/guards";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";
import { prisma } from "@/server/db/client";
import { trackActivityFromRequest } from "@/server/tracking/track-activity";

export async function requestDocumentUploadAction(
  input: unknown,
): Promise<
  ActionResult<{
    documentId: string;
    uploadUrl: string;
    expiresInSeconds: number;
  }>
> {
  const user = await requireApplyAccess();
  await enforceRateLimit(serverActionRateLimit, `upload:${user.id}`);

  const parsed = parseInput(requestDocumentUploadSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const requirement = await prisma.documentRequirement.findUnique({
    where: { id: parsed.data.requirementId },
    select: { docType: true },
  });

  if (!requirement) {
    return errorResult("Document requirement not found");
  }

  const result = await handlePresignUpload(user, {
    applicationId: parsed.data.applicationId,
    requirementId: parsed.data.requirementId,
    docType: requirement.docType,
    fileName: parsed.data.fileName,
    mimeType: parsed.data.mimeType,
    fileSize: parsed.data.fileSize,
  });

  if ("error" in result) {
    return errorResult(result.error);
  }

  return successResult(result);
}

export async function confirmDocumentUploadAction(
  input: unknown,
): Promise<
  ActionResult<{
    documentId: string;
    docType: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    requirementId: string;
  }>
> {
  const user = await requireApplyAccess();

  const parsed = parseInput(confirmDocumentUploadSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const result = await handleConfirmUpload(user, parsed.data);

  if ("error" in result) {
    return errorResult(result.error);
  }

  await trackActivityFromRequest({
    event: "document_uploaded",
    userId: user.id,
    metadata: {
      application_id: parsed.data.applicationId,
      doc_type: result.docType,
      mime_type: result.mimeType,
      file_size_kb: Math.round(result.fileSize / 1024),
    },
  });

  return successResult({
    documentId: result.documentId,
    docType: result.docType,
    fileName: result.fileName,
    mimeType: result.mimeType,
    fileSize: result.fileSize,
    requirementId: result.requirementId ?? "",
  });
}
