import "server-only";

import {
  buildPlateFormatImageObjectKey,
  validatePlateFormatImageUpload,
} from "@/features/regions/lib/plate-format-image";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import { adminRegionPlateFormatRepository } from "@/server/repositories/admin-region-plate-format-repository";
import { adminRegionRepository } from "@/server/repositories/admin-region-repository";
import {
  deleteStoredObject,
  isObjectStorageConfigured,
  putStoredObject,
} from "@/server/storage/object-storage";

export type PlateFormatImageUploadError = {
  status: number;
  error: string;
};

export async function handleUploadPlateFormatImageBytes(
  userId: string,
  formatId: string,
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
): Promise<{ ok: true } | PlateFormatImageUploadError> {
  if (!isObjectStorageConfigured()) {
    return { status: 503, error: "File storage is not available" };
  }

  const normalizedContentType = contentType.trim().toLowerCase();
  const validation = validatePlateFormatImageUpload({
    fileName,
    mimeType: normalizedContentType,
    fileSize: fileBuffer.length,
  });

  if (!validation.valid) {
    return { status: 400, error: validation.error };
  }

  const format = await adminRegionPlateFormatRepository.findFormatById(formatId);

  if (!format) {
    return { status: 404, error: "Number plate format not found" };
  }

  const nextKey = buildPlateFormatImageObjectKey({
    formatId,
    mimeType: normalizedContentType,
  });

  await putStoredObject({
    key: nextKey,
    body: fileBuffer,
    contentType: normalizedContentType,
  });

  const previousKey = format.imageR2Key;

  await prisma.regionNumberPlateFormat.update({
    where: { id: formatId },
    data: {
      imageR2Key: nextKey,
      imageMimeType: normalizedContentType,
    },
  });

  if (previousKey && previousKey !== nextKey) {
    await deleteStoredObject(previousKey).catch(() => undefined);
  }

  const region = await adminRegionRepository.findById(format.regionId);

  await auditAdminAction({
    actorId: userId,
    action: "UPDATE",
    entityType: "region_number_plate_format",
    entityId: formatId,
    after: {
      imageR2Key: nextKey,
      imageMimeType: normalizedContentType,
    },
  });

  if (region) {
    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/regions/${region.slug}`);
  }

  return { ok: true };
}

export async function handleRemovePlateFormatImage(
  userId: string,
  formatId: string,
): Promise<{ ok: true } | PlateFormatImageUploadError> {
  const format = await adminRegionPlateFormatRepository.findFormatById(formatId);

  if (!format) {
    return { status: 404, error: "Number plate format not found" };
  }

  if (!format.imageR2Key) {
    return { ok: true };
  }

  const previousKey = format.imageR2Key;

  await prisma.regionNumberPlateFormat.update({
    where: { id: formatId },
    data: {
      imageR2Key: null,
      imageMimeType: null,
    },
  });

  await deleteStoredObject(previousKey).catch(() => undefined);

  const region = await adminRegionRepository.findById(format.regionId);

  await auditAdminAction({
    actorId: userId,
    action: "UPDATE",
    entityType: "region_number_plate_format",
    entityId: formatId,
    after: {
      imageR2Key: null,
      imageMimeType: null,
    },
  });

  if (region) {
    const { revalidatePath } = await import("next/cache");
    revalidatePath(`/regions/${region.slug}`);
  }

  return { ok: true };
}

export async function readPlateFormatImageContent(formatId: string) {
  const format = await adminRegionPlateFormatRepository.findFormatById(formatId);

  if (!format?.imageR2Key || !format.imageMimeType) {
    return { status: 404 as const, error: "Image not found" };
  }

  const { readStoredObject } = await import("@/server/storage/object-storage");
  const body = await readStoredObject(format.imageR2Key);

  return {
    status: 200 as const,
    body,
    mimeType: format.imageMimeType,
    updatedAt: format.updatedAt,
  };
}
