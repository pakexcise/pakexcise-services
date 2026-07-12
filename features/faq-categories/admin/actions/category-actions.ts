"use server";

import { revalidatePath } from "next/cache";

import {
  createFaqCategorySchema,
  faqCategoryIdSchema,
  toggleFaqCategorySchema,
  updateFaqCategorySchema} from "@/lib/validations/admin-faq-category";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import { requirePermission } from "@/server/permissions/guards";
import { adminFaqCategoryRepository } from "@/server/repositories/admin-faq-category-repository";

const ADMIN_FAQ_CATEGORIES_PATH = "/admin/faq-categories";

function revalidateFaqCategoryPaths() {
  revalidatePath(ADMIN_FAQ_CATEGORIES_PATH);
  revalidatePath("/admin/faqs");
  revalidatePath("/faqs");
}

export async function createFaqCategoryAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("faq:manage");
  const parsed = parseInput(createFaqCategorySchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const data = parsed.data;
  const existing = await adminFaqCategoryRepository.findBySlug(data.slug);

  if (existing) {
    return errorResult("Slug is already in use", {
      slug: ["Slug already exists"]});
  }

  const displayOrder =
    data.displayOrder ||
    (await adminFaqCategoryRepository.getNextDisplayOrder());

  const category = await prisma.faqCategory.create({
    data: {
      slug: data.slug,
      nameEn: data.nameEn,
      descriptionEn: data.descriptionEn,
      isActive: data.isActive,
      displayOrder}});

  await auditAdminAction({
    actorId: user.id,
    action: "CREATE",
    entityType: "faq_category",
    entityId: category.id,
    after: category});

  revalidateFaqCategoryPaths();
  return successResult({ id: category.id });
}

export async function updateFaqCategoryAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("faq:manage");
  const parsed = parseInput(updateFaqCategorySchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const data = parsed.data;
  const existing = await adminFaqCategoryRepository.findById(data.id);

  if (!existing) {
    return errorResult("Category not found");
  }

  if (data.slug !== existing.slug) {
    const slugTaken = await adminFaqCategoryRepository.findBySlug(data.slug);

    if (slugTaken && slugTaken.id !== data.id) {
      return errorResult("Slug is already in use", {
        slug: ["Slug already exists"]});
    }
  }

  const category = await prisma.faqCategory.update({
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
    entityType: "faq_category",
    entityId: category.id,
    before: existing,
    after: category});

  revalidateFaqCategoryPaths();
  return successResult({ id: category.id });
}

export async function toggleFaqCategoryAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("faq:manage");
  const parsed = parseInput(toggleFaqCategorySchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const existing = await adminFaqCategoryRepository.findById(parsed.data.id);

  if (!existing) {
    return errorResult("Category not found");
  }

  const category = await prisma.faqCategory.update({
    where: { id: parsed.data.id },
    data: { isActive: parsed.data.isActive }});

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "faq_category",
    entityId: category.id,
    before: { isActive: existing.isActive },
    after: { isActive: category.isActive }});

  revalidateFaqCategoryPaths();
  return successResult({ id: category.id });
}

export async function deleteFaqCategoryAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("faq:manage");
  const parsed = parseInput(faqCategoryIdSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const existing = await adminFaqCategoryRepository.findById(parsed.data.id);

  if (!existing) {
    return errorResult("Category not found");
  }

  if (existing._count.faqs > 0) {
    return errorResult(
      "Cannot delete a category that is assigned to FAQs. Reassign or delete those FAQs first.",
    );
  }

  await prisma.faqCategory.delete({
    where: { id: parsed.data.id }});

  await auditAdminAction({
    actorId: user.id,
    action: "DELETE",
    entityType: "faq_category",
    entityId: parsed.data.id,
    before: existing});

  revalidateFaqCategoryPaths();
  return successResult({ id: parsed.data.id });
}
