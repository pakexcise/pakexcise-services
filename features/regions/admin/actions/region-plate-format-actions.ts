"use server";

import { revalidatePath } from "next/cache";
import type { VehiclePlateType } from "@prisma/client";

import {
  deleteRegionNumberPlateFormatSchema,
  reorderRegionNumberPlateFormatsSchema,
  upsertRegionNumberPlateFormatSchema,
  upsertRegionPlateFormatSectionSchema} from "@/lib/validations/admin-region-plate-format";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import { adminRegionRepository } from "@/server/repositories/admin-region-repository";
import { requirePermission } from "@/server/permissions/guards";
import { toPrismaNullableJson } from "@/lib/utils/prisma-json";

function revalidateRegionPlatePaths(regionSlug?: string) {
  revalidatePath("/admin/regions");
  revalidatePath("/regions");
  if (regionSlug) {
    revalidatePath(`/regions/${regionSlug}`);
  }
}

export async function upsertRegionPlateFormatSectionAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("region:manage");
  const parsed = parseInput(upsertRegionPlateFormatSectionSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const region = await adminRegionRepository.findById(parsed.data.regionId);

  if (!region) {
    return errorResult("Region not found");
  }

  const section = await prisma.regionPlateFormatSection.upsert({
    where: { regionId: parsed.data.regionId },
    update: {
      sectionTitleEn: parsed.data.sectionTitleEn ?? null,
      sectionDescEn: parsed.data.sectionDescEn ?? null,
      faqJson: toPrismaNullableJson(parsed.data.faqJson),
      isActive: parsed.data.isActive,
      showOnRegionPage: parsed.data.showOnRegionPage},
    create: {
      regionId: parsed.data.regionId,
      sectionTitleEn: parsed.data.sectionTitleEn ?? null,
      sectionDescEn: parsed.data.sectionDescEn ?? null,
      faqJson: toPrismaNullableJson(parsed.data.faqJson),
      isActive: parsed.data.isActive,
      showOnRegionPage: parsed.data.showOnRegionPage}});

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "region_plate_format_section",
    entityId: section.id,
    after: parsed.data});

  revalidateRegionPlatePaths(region.slug);

  return successResult({ id: section.id });
}

export async function upsertRegionNumberPlateFormatAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("region:manage");
  const parsed = parseInput(upsertRegionNumberPlateFormatSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const region = await adminRegionRepository.findById(parsed.data.regionId);

  if (!region) {
    return errorResult("Region not found");
  }

  const data = {
    regionId: parsed.data.regionId,
    vehicleType: parsed.data.vehicleType as VehiclePlateType,
    titleEn: parsed.data.titleEn,
    formatsJson: parsed.data.formats,
    descriptionEn: parsed.data.descriptionEn ?? null,
    relatedServiceSlugs: toPrismaNullableJson(parsed.data.relatedServiceSlugs),
    imageAltEn: parsed.data.imageAltEn ?? null,
    imageCaptionEn: parsed.data.imageCaptionEn ?? null,
    isActive: parsed.data.isActive,
    isFeatured: parsed.data.isFeatured,
    showOnRegionPage: parsed.data.showOnRegionPage,
    displayOrder: parsed.data.displayOrder};

  const format = parsed.data.id
    ? await prisma.regionNumberPlateFormat.update({
        where: { id: parsed.data.id },
        data})
    : await prisma.regionNumberPlateFormat.create({ data });

  await auditAdminAction({
    actorId: user.id,
    action: parsed.data.id ? "UPDATE" : "CREATE",
    entityType: "region_number_plate_format",
    entityId: format.id,
    after: parsed.data});

  revalidateRegionPlatePaths(region.slug);

  return successResult({ id: format.id });
}

export async function deleteRegionNumberPlateFormatAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("region:manage");
  const parsed = parseInput(deleteRegionNumberPlateFormatSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const existing = await prisma.regionNumberPlateFormat.findFirst({
    where: { id: parsed.data.id, deletedAt: null },
    select: {
      id: true,
      regionId: true,
      imageR2Key: true,
      region: { select: { slug: true } }}});

  if (!existing) {
    return errorResult("Number plate format not found");
  }

  await prisma.regionNumberPlateFormat.update({
    where: { id: existing.id },
    data: { deletedAt: new Date(), isActive: false }});

  if (existing.imageR2Key) {
    const { deleteStoredObject } = await import("@/server/storage/object-storage");
    await deleteStoredObject(existing.imageR2Key).catch(() => undefined);
  }

  await auditAdminAction({
    actorId: user.id,
    action: "DELETE",
    entityType: "region_number_plate_format",
    entityId: existing.id});

  revalidateRegionPlatePaths(existing.region.slug);

  return successResult({ id: existing.id });
}

export async function reorderRegionNumberPlateFormatsAction(
  input: unknown,
): Promise<ActionResult<{ updated: number }>> {
  const user = await requirePermission("region:manage");
  const parsed = parseInput(reorderRegionNumberPlateFormatsSchema, input);

  if (!parsed.success) {
    return errorResult(parsed.error, parsed.fieldErrors);
  }

  const region = await adminRegionRepository.findById(parsed.data.regionId);

  if (!region) {
    return errorResult("Region not found");
  }

  await prisma.$transaction(
    parsed.data.orderedIds.map((id, index) =>
      prisma.regionNumberPlateFormat.updateMany({
        where: { id, regionId: parsed.data.regionId, deletedAt: null },
        data: { displayOrder: index + 1 }}),
    ),
  );

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "region_number_plate_format",
    entityId: parsed.data.regionId,
    after: { orderedIds: parsed.data.orderedIds }});

  revalidateRegionPlatePaths(region.slug);

  return successResult({ updated: parsed.data.orderedIds.length });
}
