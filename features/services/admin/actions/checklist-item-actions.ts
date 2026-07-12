"use server";

import { revalidatePath } from "next/cache";

import {
  checklistItemSchema,
  deleteChecklistItemSchema} from "@/lib/validations/admin-checklist-item";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { requirePermission } from "@/server/permissions/guards";
import { prisma } from "@/server/db/client";

const DEFAULT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf"];

export async function upsertChecklistItemAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("service:manage");
  const parsed = parseInput(checklistItemSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const data = parsed.data;
  const payload = {
    slug: data.slug,
    nameEn: data.nameEn,
    descriptionEn: data.descriptionEn,
    itemType: data.itemType,
    displayOrder: data.displayOrder,
    isActive: data.isActive};

  const duplicate = await prisma.checklistItem.findFirst({
    where: {
      slug: data.slug,
      ...(data.id ? { NOT: { id: data.id } } : {})},
    select: { id: true }});

  if (duplicate) {
    return errorResult("A checklist item with this slug already exists");
  }

  if (data.id) {
    const updated = await prisma.checklistItem.update({
      where: { id: data.id },
      data: payload});

    await auditAdminAction({
      actorId: user.id,
      action: "UPDATE",
      entityType: "checklist_item",
      entityId: updated.id,
      after: { slug: updated.slug }});

    revalidatePath("/admin/checklist-items");
    return successResult({ id: updated.id });
  }

  const created = await prisma.checklistItem.create({
    data: {
      ...payload,
      defaultAcceptedMimeTypes: DEFAULT_MIME_TYPES}});

  await auditAdminAction({
    actorId: user.id,
    action: "CREATE",
    entityType: "checklist_item",
    entityId: created.id,
    after: { slug: created.slug }});

  revalidatePath("/admin/checklist-items");
  return successResult({ id: created.id });
}

export async function deleteChecklistItemAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("service:manage");
  const parsed = parseInput(deleteChecklistItemSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const assignmentCount = await prisma.documentRequirement.count({
    where: { checklistItemId: parsed.data.id }});

  if (assignmentCount > 0) {
    return errorResult(
      "This checklist item is assigned to services. Remove assignments first or deactivate it.",
    );
  }

  await prisma.checklistItem.delete({ where: { id: parsed.data.id } });

  await auditAdminAction({
    actorId: user.id,
    action: "DELETE",
    entityType: "checklist_item",
    entityId: parsed.data.id});

  revalidatePath("/admin/checklist-items");
  return successResult({ id: parsed.data.id });
}
