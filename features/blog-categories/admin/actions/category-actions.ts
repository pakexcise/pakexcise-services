"use server";

import { revalidatePath } from "next/cache";

import { normalizeUrduBrandText } from "@/features/blog/lib/blog-brand";
import {
  blogCategoryIdSchema,
  createBlogCategorySchema,
  toggleBlogCategorySchema,
  updateBlogCategorySchema,
} from "@/lib/validations/admin-blog-category";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import { requirePermission } from "@/server/permissions/guards";
import { adminBlogCategoryRepository } from "@/server/repositories/admin-blog-category-repository";

const ADMIN_BLOG_CATEGORIES_PATH = "/admin/blog-categories";
const ADMIN_BLOG_PATH = "/admin/blog";

function revalidateBlogCategoryPaths() {
  revalidatePath(ADMIN_BLOG_CATEGORIES_PATH);
  revalidatePath(ADMIN_BLOG_PATH);
  revalidatePath("/blog");
}

async function validateParentAssignment(
  parentId: string | null,
  categoryId?: string,
): Promise<ActionResult<null>> {
  if (!parentId) {
    return successResult(null);
  }

  if (categoryId && parentId === categoryId) {
    return errorResult("A category cannot be its own parent");
  }

  const parent = await adminBlogCategoryRepository.findById(parentId);

  if (!parent) {
    return errorResult("Selected parent category was not found");
  }

  if (parent.parentId) {
    return errorResult("Sub-categories cannot have another sub-category as parent");
  }

  if (categoryId && parent._count.children > 0) {
    const isChild = await prisma.blogCategory.findFirst({
      where: { id: parentId, parentId: categoryId },
      select: { id: true },
    });

    if (isChild) {
      return errorResult("Invalid parent selection");
    }
  }

  return successResult(null);
}

export async function createBlogCategoryAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("content:manage");
  const parsed = parseInput(createBlogCategorySchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const data = parsed.data;
  const existing = await adminBlogCategoryRepository.findBySlug(data.slug);

  if (existing) {
    return errorResult("Slug is already in use", {
      slug: ["Slug already exists"],
    });
  }

  const parentValidation = await validateParentAssignment(data.parentId ?? null);
  if (!parentValidation.success) {
    return parentValidation;
  }

  const displayOrder =
    data.displayOrder ||
    (await adminBlogCategoryRepository.getNextDisplayOrder(data.parentId ?? null));

  const category = await prisma.blogCategory.create({
    data: {
      slug: data.slug,
      nameEn: data.nameEn,
      nameUr: normalizeUrduBrandText(data.nameUr),
      parentId: data.parentId,
      isActive: data.isActive,
      displayOrder,
    },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "CREATE",
    entityType: "blog_category",
    entityId: category.id,
    after: category,
  });

  revalidateBlogCategoryPaths();
  return successResult({ id: category.id });
}

export async function updateBlogCategoryAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("content:manage");
  const parsed = parseInput(updateBlogCategorySchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const data = parsed.data;
  const existing = await adminBlogCategoryRepository.findById(data.id);

  if (!existing) {
    return errorResult("Category not found");
  }

  if (data.slug !== existing.slug) {
    const slugTaken = await adminBlogCategoryRepository.findBySlug(data.slug);

    if (slugTaken && slugTaken.id !== data.id) {
      return errorResult("Slug is already in use", {
        slug: ["Slug already exists"],
      });
    }
  }

  const parentValidation = await validateParentAssignment(
    data.parentId ?? null,
    data.id,
  );
  if (!parentValidation.success) {
    return parentValidation;
  }

  const nextParentId = data.parentId ?? null;
  const parentChanged = (existing.parentId ?? null) !== nextParentId;

  if (parentChanged && existing._count.children > 0) {
    return errorResult(
      "Cannot change category level while it has sub-categories. Reassign or delete sub-categories first.",
    );
  }

  if (parentChanged && adminBlogCategoryRepository.getAssignedPostCount(existing) > 0) {
    return errorResult(
      "Cannot change category level while blog posts are assigned to it.",
    );
  }

  const category = await prisma.blogCategory.update({
    where: { id: data.id },
    data: {
      slug: data.slug,
      nameEn: data.nameEn,
      nameUr: normalizeUrduBrandText(data.nameUr),
      parentId: nextParentId,
      isActive: data.isActive,
      displayOrder: data.displayOrder,
    },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "blog_category",
    entityId: category.id,
    before: existing,
    after: category,
  });

  revalidateBlogCategoryPaths();
  return successResult({ id: category.id });
}

export async function toggleBlogCategoryAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("content:manage");
  const parsed = parseInput(toggleBlogCategorySchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const existing = await adminBlogCategoryRepository.findById(parsed.data.id);

  if (!existing) {
    return errorResult("Category not found");
  }

  const category = await prisma.blogCategory.update({
    where: { id: parsed.data.id },
    data: { isActive: parsed.data.isActive },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "blog_category",
    entityId: category.id,
    before: { isActive: existing.isActive },
    after: { isActive: category.isActive },
  });

  revalidateBlogCategoryPaths();
  return successResult({ id: category.id });
}

export async function deleteBlogCategoryAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("content:manage");
  const parsed = parseInput(blogCategoryIdSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const existing = await adminBlogCategoryRepository.findById(parsed.data.id);

  if (!existing) {
    return errorResult("Category not found");
  }

  if (existing._count.children > 0) {
    return errorResult(
      "Cannot delete a category that has sub-categories. Delete or reassign sub-categories first.",
    );
  }

  if (adminBlogCategoryRepository.getAssignedPostCount(existing) > 0) {
    return errorResult(
      "Cannot delete a category assigned to blog posts. Reassign those posts first.",
    );
  }

  await prisma.blogCategory.delete({
    where: { id: parsed.data.id },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "DELETE",
    entityType: "blog_category",
    entityId: parsed.data.id,
    before: existing,
  });

  revalidateBlogCategoryPaths();
  return successResult({ id: parsed.data.id });
}
