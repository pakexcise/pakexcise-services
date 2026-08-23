"use server";

import { revalidatePath } from "next/cache";

import {
  createServiceCategorySchema,
  reorderServiceCategoriesSchema,
  serviceCategoryIdSchema,
  toggleServiceCategorySchema,
  updateServiceCategorySchema} from "@/lib/validations/admin-service-category";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import { requirePermission } from "@/server/permissions/guards";
import { adminServiceCategoryRepository } from "@/server/repositories/admin-service-category-repository";

const ADMIN_CATEGORIES_PATH = "/admin/service-categories";

function revalidateCategoryPaths() {
  revalidatePath(ADMIN_CATEGORIES_PATH);
  revalidatePath("/services");
}

export async function createServiceCategoryAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("service:manage");
  const parsed = parseInput(createServiceCategorySchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const data = parsed.data;
  const existing = await adminServiceCategoryRepository.findBySlug(data.slug);

  if (existing) {
    return errorResult("Slug is already in use", {
      slug: ["Slug already exists"]});
  }

  const displayOrder =
    data.displayOrder ||
    (await adminServiceCategoryRepository.getNextDisplayOrder());

  const category = await prisma.serviceCategory.create({
    data: {
      slug: data.slug,
      nameEn: data.nameEn,
      descriptionEn: data.descriptionEn,
      isActive: data.isActive,
      displayOrder}});

  await auditAdminAction({
    actorId: user.id,
    action: "CREATE",
    entityType: "service_category",
    entityId: category.id,
    after: category});

  revalidateCategoryPaths();
  return successResult({ id: category.id });
}

export async function updateServiceCategoryAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("service:manage");
  const parsed = parseInput(updateServiceCategorySchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const data = parsed.data;
  const existing = await adminServiceCategoryRepository.findById(data.id);

  if (!existing) {
    return errorResult("Category not found");
  }

  if (data.slug !== existing.slug) {
    const slugTaken = await adminServiceCategoryRepository.findBySlug(data.slug);

    if (slugTaken && slugTaken.id !== data.id) {
      return errorResult("Slug is already in use", {
        slug: ["Slug already exists"]});
    }
  }

  const category = await prisma.serviceCategory.update({
    where: { id: data.id },
    data: {
      slug: data.slug,
      nameEn: data.nameEn,
      descriptionEn: data.descriptionEn,
      isActive: data.isActive,
      displayOrder: data.displayOrder}});

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "service_category",
    entityId: category.id,
    before: existing,
    after: category});

  revalidateCategoryPaths();
  return successResult({ id: category.id });
}

export async function toggleServiceCategoryAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("service:manage");
  const parsed = parseInput(toggleServiceCategorySchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const existing = await adminServiceCategoryRepository.findById(parsed.data.id);

  if (!existing) {
    return errorResult("Category not found");
  }

  const category = await prisma.serviceCategory.update({
    where: { id: parsed.data.id },
    data: { isActive: parsed.data.isActive }});

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "service_category",
    entityId: category.id,
    before: { isActive: existing.isActive },
    after: { isActive: category.isActive }});

  revalidateCategoryPaths();
  return successResult({ id: category.id });
}

export async function reorderServiceCategoriesAction(
  input: unknown,
): Promise<ActionResult<{ count: number }>> {
  const user = await requirePermission("service:manage");
  const parsed = parseInput(reorderServiceCategoriesSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  await prisma.$transaction(
    parsed.data.orderedIds.map((id, index) =>
      prisma.serviceCategory.update({
        where: { id },
        data: { displayOrder: index }}),
    ),
  );

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "service_category",
    entityId: "reorder",
    after: { orderedIds: parsed.data.orderedIds }});

  revalidateCategoryPaths();
  return successResult({ count: parsed.data.orderedIds.length });
}

export async function deleteServiceCategoryAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("service:manage");
  const parsed = parseInput(serviceCategoryIdSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const existing = await adminServiceCategoryRepository.findById(parsed.data.id);

  if (!existing) {
    return errorResult("Category not found");
  }

  if (existing.isActive) {
    return errorResult(
      "Deactivate this category before deleting it.",
    );
  }

  if (existing._count.services > 0) {
    return errorResult(
      "Cannot delete a category that still has services assigned. Reassign those services first.",
    );
  }

  await prisma.serviceCategory.delete({
    where: { id: parsed.data.id },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "DELETE",
    entityType: "service_category",
    entityId: parsed.data.id,
    before: existing,
  });

  revalidateCategoryPaths();
  return successResult({ id: parsed.data.id });
}
