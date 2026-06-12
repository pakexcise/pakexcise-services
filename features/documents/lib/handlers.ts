import "server-only";

import { randomUUID } from "node:crypto";

import {
  buildApplicationDocumentKey,
  COMPLETION_PROOF_DOC_TYPE,
  DEFAULT_ACCEPTED_MIME_TYPES,
  DEFAULT_MAX_FILE_SIZE_BYTES,
  type UploadValidationErrorCode,
  validateUploadFile,
} from "@/config/uploads";
import { auditDocumentEvent } from "@/features/documents/lib/audit";
import {
  canDeleteDocument,
  canUploadCompletionProof,
  canUploadToApplication,
  canVerifyDocument,
  canViewDocument,
} from "@/features/documents/lib/access";
import {
  approveDocumentSchema,
  confirmDocumentUploadSchema,
  deleteDocumentSchema,
  presignUploadRequestSchema,
  rejectDocumentSchema,
  signedUrlPurposeSchema,
} from "@/lib/validations/documents";
import { parseInput } from "@/lib/validations/common";
import type { CurrentUser } from "@/server/auth/current-user";
import { prisma } from "@/server/db/client";
import { documentRepository } from "@/server/repositories/document-repository";
import { createPresignedDownloadUrl } from "@/server/r2/presign-download";
import { createPresignedUploadUrl } from "@/server/r2/presign-upload";
import {
  deleteStoredObject,
  headStoredObject,
  isObjectStorageConfigured,
  putStoredObject,
  readStoredObject,
  usesLocalDevStorage,
} from "@/server/storage/object-storage";
import { enqueueVirusScan } from "@/server/queue/virus-scan";

export type DocumentHandlerError = {
  status: number;
  error: string;
};

export type PresignUploadSuccess = {
  documentId: string;
  uploadUrl: string;
  expiresInSeconds: number;
};

function validationErrorMessage(code: UploadValidationErrorCode): string {
  switch (code) {
    case "INVALID_NAME":
      return "Invalid file name";
    case "DOUBLE_EXTENSION":
      return "File name contains a double extension";
    case "INVALID_EXTENSION":
      return "File extension is not allowed";
    case "MIME_MISMATCH":
      return "File extension does not match MIME type";
    case "INVALID_MIME":
      return "File type is not allowed";
    case "FILE_TOO_LARGE":
      return "File exceeds the maximum allowed size";
    case "EMPTY_FILE":
      return "File is empty";
    default:
      return "Invalid file";
  }
}

export async function handlePresignUpload(
  user: CurrentUser,
  body: unknown,
): Promise<PresignUploadSuccess | DocumentHandlerError> {
  if (!isObjectStorageConfigured()) {
    return { status: 503, error: "Document upload is not available" };
  }

  const parsed = parseInput(presignUploadRequestSchema, body);

  if (!parsed.success) {
    return { status: 400, error: parsed.error };
  }

  const application = await prisma.application.findUnique({
    where: { id: parsed.data.applicationId },
    select: {
      id: true,
      userId: true,
      agentId: true,
      status: true,
      serviceId: true,
    },
  });

  if (!application) {
    return { status: 404, error: "Application not found" };
  }

  const isCompletionProof = parsed.data.docType === COMPLETION_PROOF_DOC_TYPE;

  if (isCompletionProof) {
    if (!canUploadCompletionProof(user, application)) {
      return { status: 403, error: "Upload not allowed for this application" };
    }
  } else if (!canUploadToApplication(user, application)) {
    return { status: 403, error: "Upload not allowed for this application" };
  }

  let maxSizeBytes = DEFAULT_MAX_FILE_SIZE_BYTES;
  let acceptedMimeTypes: string[] = [...DEFAULT_ACCEPTED_MIME_TYPES];
  let docType = parsed.data.docType;

  if (parsed.data.requirementId) {
    const requirement = await prisma.documentRequirement.findFirst({
      where: {
        id: parsed.data.requirementId,
        serviceId: application.serviceId,
        isActive: true,
      },
    });

    if (!requirement) {
      return { status: 404, error: "Document requirement not found" };
    }

    docType = requirement.docType;
    maxSizeBytes = requirement.maxSizeBytes;
    acceptedMimeTypes = Array.isArray(requirement.acceptedMimeTypes)
      ? requirement.acceptedMimeTypes.filter(
          (mime): mime is string => typeof mime === "string",
        )
      : [...DEFAULT_ACCEPTED_MIME_TYPES];
  }

  const fileValidation = validateUploadFile({
    fileName: parsed.data.fileName,
    mimeType: parsed.data.mimeType,
    fileSize: parsed.data.fileSize,
    maxSizeBytes,
    acceptedMimeTypes,
  });

  if (!fileValidation.valid) {
    return {
      status: 400,
      error: validationErrorMessage(fileValidation.code),
    };
  }

  if (parsed.data.requirementId) {
    await documentRepository.deletePendingForRequirement({
      applicationId: application.id,
      requirementId: parsed.data.requirementId,
    });
  }

  const fileId = randomUUID();
  const r2Key = buildApplicationDocumentKey({
    applicationId: application.id,
    docType,
    fileId,
    extension: fileValidation.extension,
  });

  const document = await documentRepository.createPending({
    applicationId: application.id,
    requirementId: parsed.data.requirementId,
    uploadedById: user.id,
    type: docType,
    r2Key,
    fileName: parsed.data.fileName,
    mimeType: parsed.data.mimeType,
    fileSize: parsed.data.fileSize,
  });

  try {
    const presigned = await createPresignedUploadUrl({
      key: r2Key,
      contentType: parsed.data.mimeType,
    });

    return {
      documentId: document.id,
      uploadUrl: presigned.uploadUrl,
      expiresInSeconds: presigned.expiresInSeconds,
    };
  } catch {
    await documentRepository.deleteById(document.id);
    return { status: 503, error: "Could not create upload URL" };
  }
}

export async function handleConfirmUpload(
  user: CurrentUser,
  body: unknown,
): Promise<
  | {
      documentId: string;
      fileName: string;
      mimeType: string;
      fileSize: number;
      docType: string;
      requirementId: string | null;
    }
  | DocumentHandlerError
> {
  const parsed = parseInput(confirmDocumentUploadSchema, body);

  if (!parsed.success) {
    return { status: 400, error: parsed.error };
  }

  const document = await documentRepository.findByIdWithApplication(
    parsed.data.documentId,
  );

  if (!document) {
    return { status: 404, error: "Document not found" };
  }

  if (
    parsed.data.applicationId &&
    parsed.data.applicationId !== document.applicationId
  ) {
    return { status: 403, error: "Document does not belong to this application" };
  }

  const isCompletionProof = document.type === COMPLETION_PROOF_DOC_TYPE;

  if (isCompletionProof) {
    if (!canUploadCompletionProof(user, document.application)) {
      return { status: 403, error: "Upload not allowed" };
    }
  } else if (!canUploadToApplication(user, document.application)) {
    return { status: 403, error: "Upload not allowed" };
  }

  if (document.uploadedById && document.uploadedById !== user.id) {
    const isStaff = canVerifyDocument(user);
    if (!isStaff) {
      return { status: 403, error: "Upload not allowed" };
    }
  }

  const head = await headStoredObject(document.r2Key);

  if (!head || !head.contentLength) {
    return { status: 400, error: "Uploaded file was not found in storage" };
  }

  const checksum = parsed.data.checksum ?? head.etag ?? null;

  await documentRepository.updateAfterUpload({
    documentId: document.id,
    fileSize: head.contentLength,
    checksum,
  });

  if (document.type === COMPLETION_PROOF_DOC_TYPE && canUploadCompletionProof(user, document.application)) {
    await documentRepository.setStatus({
      documentId: document.id,
      status: "APPROVED",
      verifiedById: user.id,
    });
  }

  await enqueueVirusScan({
    documentId: document.id,
    applicationId: document.applicationId,
    r2Key: document.r2Key,
    mimeType: document.mimeType,
    fileSize: head.contentLength,
  });

  await auditDocumentEvent({
    actorId: user.id,
    documentId: document.id,
    applicationId: document.applicationId,
    operation: "upload",
    details: {
      docType: document.type,
      fileSize: head.contentLength,
    },
  });

  return {
    documentId: document.id,
    fileName: document.fileName,
    mimeType: document.mimeType,
    fileSize: head.contentLength,
    docType: document.type,
    requirementId: document.requirementId,
  };
}

export async function handleUploadDocumentBytes(
  user: CurrentUser,
  documentId: string,
  fileBuffer: Buffer,
  contentType: string,
): Promise<{ ok: true } | DocumentHandlerError> {
  if (!isObjectStorageConfigured()) {
    return { status: 503, error: "Document upload is not available" };
  }

  if (fileBuffer.length <= 0) {
    return { status: 400, error: "File is empty" };
  }

  const document = await documentRepository.findByIdWithApplication(documentId);

  if (!document) {
    return { status: 404, error: "Document not found" };
  }

  if (document.status !== "PENDING") {
    return { status: 400, error: "Document is not awaiting upload" };
  }

  const isCompletionProof = document.type === COMPLETION_PROOF_DOC_TYPE;

  if (isCompletionProof) {
    if (!canUploadCompletionProof(user, document.application)) {
      return { status: 403, error: "Upload not allowed" };
    }
  } else if (!canUploadToApplication(user, document.application)) {
    return { status: 403, error: "Upload not allowed" };
  }

  if (document.uploadedById && document.uploadedById !== user.id) {
    const isStaff = canVerifyDocument(user);
    if (!isStaff) {
      return { status: 403, error: "Upload not allowed" };
    }
  }

  if (fileBuffer.length > document.fileSize * 2) {
    return { status: 400, error: "File exceeds the maximum allowed size" };
  }

  const normalizedContentType = contentType.trim();

  if (
    normalizedContentType &&
    normalizedContentType !== "application/octet-stream" &&
    normalizedContentType !== document.mimeType
  ) {
    return { status: 400, error: "File type does not match the selected document" };
  }

  try {
    await putStoredObject({
      key: document.r2Key,
      body: fileBuffer,
      contentType: document.mimeType,
    });
  } catch {
    return { status: 503, error: "Could not store uploaded file" };
  }

  return { ok: true };
}

export async function handleDocumentContent(
  user: CurrentUser,
  documentId: string,
): Promise<
  | {
      body: Buffer;
      mimeType: string;
      fileName: string;
    }
  | DocumentHandlerError
> {
  if (!usesLocalDevStorage()) {
    return { status: 404, error: "Direct document content is not available" };
  }

  const document = await documentRepository.findByIdWithApplication(documentId);

  if (!document) {
    return { status: 404, error: "Document not found" };
  }

  if (!canViewDocument(user, document.application, document, "view")) {
    return { status: 403, error: "Document access denied" };
  }

  try {
    const body = await readStoredObject(document.r2Key);

    return {
      body,
      mimeType: document.mimeType,
      fileName: document.fileName,
    };
  } catch {
    return { status: 404, error: "Document file was not found" };
  }
}

export async function handleSignedUrl(
  user: CurrentUser,
  documentId: string,
  purposeInput: string | null,
): Promise<
  | {
      signedUrl: string;
      expiresInSeconds: number;
      mimeType: string;
      fileName: string;
    }
  | DocumentHandlerError
> {
  if (!isObjectStorageConfigured()) {
    return { status: 503, error: "Document viewing is not available" };
  }

  const purposeParsed = signedUrlPurposeSchema.safeParse(purposeInput ?? "view");

  if (!purposeParsed.success) {
    return { status: 400, error: "Invalid purpose" };
  }

  const purpose = purposeParsed.data;

  const document = await documentRepository.findByIdWithApplication(documentId);

  if (!document) {
    return { status: 404, error: "Document not found" };
  }

  if (!canViewDocument(user, document.application, document, purpose)) {
    return { status: 403, error: "Document access denied" };
  }

  if (usesLocalDevStorage()) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    return {
      signedUrl: `${appUrl.replace(/\/$/, "")}/api/documents/${document.id}/content`,
      expiresInSeconds: 60 * 60,
      mimeType: document.mimeType,
      fileName: document.fileName,
    };
  }

  try {
    const presigned = await createPresignedDownloadUrl({
      key: document.r2Key,
      fileName: document.fileName,
      mimeType: document.mimeType,
      purpose,
    });

    await auditDocumentEvent({
      actorId: user.id,
      documentId: document.id,
      applicationId: document.applicationId,
      operation: "view",
      details: { purpose },
    });

    return {
      signedUrl: presigned.signedUrl,
      expiresInSeconds: presigned.expiresInSeconds,
      mimeType: document.mimeType,
      fileName: document.fileName,
    };
  } catch {
    return { status: 503, error: "Could not create signed URL" };
  }
}

export async function handleApproveDocument(
  user: CurrentUser,
  body: unknown,
): Promise<{ documentId: string; status: "APPROVED" } | DocumentHandlerError> {
  if (!canVerifyDocument(user)) {
    return { status: 403, error: "Document verification not allowed" };
  }

  const parsed = parseInput(approveDocumentSchema, body);

  if (!parsed.success) {
    return { status: 400, error: parsed.error };
  }

  const document = await documentRepository.findByIdWithApplication(
    parsed.data.documentId,
  );

  if (!document) {
    return { status: 404, error: "Document not found" };
  }

  await documentRepository.setStatus({
    documentId: document.id,
    status: "APPROVED",
    verifiedById: user.id,
    rejectionReason: null,
  });

  await auditDocumentEvent({
    actorId: user.id,
    documentId: document.id,
    applicationId: document.applicationId,
    operation: "approve",
  });

  return { documentId: document.id, status: "APPROVED" };
}

export async function handleRejectDocument(
  user: CurrentUser,
  body: unknown,
): Promise<{ documentId: string; status: "REJECTED" } | DocumentHandlerError> {
  if (!canVerifyDocument(user)) {
    return { status: 403, error: "Document verification not allowed" };
  }

  const parsed = parseInput(rejectDocumentSchema, body);

  if (!parsed.success) {
    return { status: 400, error: parsed.error };
  }

  const document = await documentRepository.findByIdWithApplication(
    parsed.data.documentId,
  );

  if (!document) {
    return { status: 404, error: "Document not found" };
  }

  await documentRepository.setStatus({
    documentId: document.id,
    status: "REJECTED",
    verifiedById: user.id,
    rejectionReason: parsed.data.reason,
  });

  await auditDocumentEvent({
    actorId: user.id,
    documentId: document.id,
    applicationId: document.applicationId,
    operation: "reject",
    details: { reason: parsed.data.reason },
  });

  return { documentId: document.id, status: "REJECTED" };
}

export async function handleDeleteDocument(
  user: CurrentUser,
  body: unknown,
): Promise<{ documentId: string } | DocumentHandlerError> {
  const parsed = parseInput(deleteDocumentSchema, body);

  if (!parsed.success) {
    return { status: 400, error: parsed.error };
  }

  const document = await documentRepository.findByIdWithApplication(
    parsed.data.documentId,
  );

  if (!document) {
    return { status: 404, error: "Document not found" };
  }

  if (!canDeleteDocument(user, document.application, document)) {
    return { status: 403, error: "Document delete not allowed" };
  }

  await auditDocumentEvent({
    actorId: user.id,
    documentId: document.id,
    applicationId: document.applicationId,
    operation: "delete",
    details: { docType: document.type },
  });

  try {
    await deleteStoredObject(document.r2Key);
  } catch {
    // Continue deleting metadata even if object removal fails.
  }

  await documentRepository.deleteById(document.id);

  return { documentId: document.id };
}
