"use server";

import { z } from "zod";

import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import {
  documentIdParamSchema,
  documentPurposeQuerySchema,
} from "@/lib/validations/route-params";
import {
  handleApproveDocument,
  handleConfirmUpload,
  handleDeleteDocument,
  handlePresignUpload,
  handleRejectDocument,
  handleSignedUrl,
} from "@/features/documents/lib/handlers";
import { requireUser } from "@/server/permissions/guards";
import { enforceRateLimit, serverActionRateLimit } from "@/server/security/rate-limit";

function mapHandlerError<T>(result: T | { status: number; error: string }): ActionResult<T> {
  if (typeof result === "object" && result !== null && "error" in result && "status" in result) {
    return errorResult(result.error);
  }

  return successResult(result as T);
}

export async function requestPresignedUploadAction(
  input: unknown,
): Promise<
  ActionResult<{
    documentId: string;
    uploadUrl: string;
    expiresInSeconds: number;
  }>
> {
  const user = await requireUser();
  await enforceRateLimit(serverActionRateLimit, `upload:${user.id}`);

  const result = await handlePresignUpload(user, input);
  return mapHandlerError(result);
}

export async function confirmDocumentUploadAction(
  input: unknown,
): Promise<
  ActionResult<{
    documentId: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    docType: string;
    requirementId: string | null;
  }>
> {
  const user = await requireUser();
  const result = await handleConfirmUpload(user, input);
  return mapHandlerError(result);
}

const documentSignedUrlSchema = z.object({
  documentId: documentIdParamSchema,
  purpose: documentPurposeQuerySchema,
});

export async function getDocumentSignedUrlAction(
  input: unknown,
): Promise<
  ActionResult<{
    signedUrl: string;
    expiresInSeconds: number;
    mimeType: string;
    fileName: string;
  }>
> {
  const user = await requireUser();
  await enforceRateLimit(serverActionRateLimit, `doc-view:${user.id}`);

  const parsed = parseInput(documentSignedUrlSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const result = await handleSignedUrl(
    user,
    parsed.data.documentId,
    parsed.data.purpose,
  );
  return mapHandlerError(result);
}

export async function approveDocumentAction(
  input: unknown,
): Promise<ActionResult<{ documentId: string; status: "APPROVED" }>> {
  const user = await requireUser();
  const result = await handleApproveDocument(user, input);
  return mapHandlerError(result);
}

export async function rejectDocumentAction(
  input: unknown,
): Promise<ActionResult<{ documentId: string; status: "REJECTED" }>> {
  const user = await requireUser();
  const result = await handleRejectDocument(user, input);
  return mapHandlerError(result);
}

export async function deleteDocumentAction(
  input: unknown,
): Promise<ActionResult<{ documentId: string }>> {
  const user = await requireUser();
  const result = await handleDeleteDocument(user, input);
  return mapHandlerError(result);
}
