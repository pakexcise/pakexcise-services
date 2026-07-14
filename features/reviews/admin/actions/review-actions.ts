"use server";

import { revalidatePath } from "next/cache";

import { reviewAuditSnapshot } from "@/features/reviews/admin/lib/review-snapshots";
import {
  createReviewSchema,
  reorderReviewsSchema,
  reviewIdSchema,
  toggleReviewSchema,
  updateReviewSchema,
} from "@/lib/validations/admin-review";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import { requirePermission } from "@/server/permissions/guards";
import { adminReviewRepository } from "@/server/repositories/admin-review-repository";

function revalidateReviewPaths() {
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  revalidatePath("/");
}

export async function createReviewAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("content:manage");
  const parsed = parseInput(createReviewSchema, input);
  if (!parsed.success) return parsed;

  const data = parsed.data;
  const displayOrder =
    data.displayOrder || (await adminReviewRepository.getNextDisplayOrder());
  const review = await prisma.review.create({
    data: {
      ...data,
      authorRoleEn: data.authorRoleEn || null,
      displayOrder,
    },
  });
  const created = await adminReviewRepository.findById(review.id);

  await auditAdminAction({
    actorId: user.id,
    action: "CREATE",
    entityType: "review",
    entityId: review.id,
    after: reviewAuditSnapshot(created),
  });
  revalidateReviewPaths();
  return successResult({ id: review.id });
}

export async function updateReviewAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("content:manage");
  const parsed = parseInput(updateReviewSchema, input);
  if (!parsed.success) return parsed;

  const existing = await adminReviewRepository.findById(parsed.data.id);
  if (!existing) return errorResult("Review not found");

  const before = reviewAuditSnapshot(existing);
  const { id, ...data } = parsed.data;
  await prisma.review.update({
    where: { id },
    data: { ...data, authorRoleEn: data.authorRoleEn || null },
  });
  const updated = await adminReviewRepository.findById(id);

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "review",
    entityId: id,
    before,
    after: reviewAuditSnapshot(updated),
  });
  revalidateReviewPaths();
  return successResult({ id });
}

export async function deleteReviewAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("content:manage");
  const parsed = parseInput(reviewIdSchema, input);
  if (!parsed.success) return parsed;

  const existing = await adminReviewRepository.findById(parsed.data.id);
  if (!existing) return errorResult("Review not found");

  await prisma.review.delete({ where: { id: parsed.data.id } });
  await auditAdminAction({
    actorId: user.id,
    action: "DELETE",
    entityType: "review",
    entityId: parsed.data.id,
    before: reviewAuditSnapshot(existing),
  });
  revalidateReviewPaths();
  return successResult({ id: parsed.data.id });
}

export async function toggleReviewActiveAction(
  input: unknown,
): Promise<ActionResult<{ id: string; isActive: boolean }>> {
  const user = await requirePermission("content:manage");
  const parsed = parseInput(toggleReviewSchema, input);
  if (!parsed.success) return parsed;

  const existing = await adminReviewRepository.findById(parsed.data.id);
  if (!existing) return errorResult("Review not found");

  await prisma.review.update({
    where: { id: parsed.data.id },
    data: { isActive: parsed.data.isActive },
  });
  const updated = await adminReviewRepository.findById(parsed.data.id);
  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "review",
    entityId: parsed.data.id,
    before: reviewAuditSnapshot(existing),
    after: reviewAuditSnapshot(updated),
  });
  revalidateReviewPaths();
  return successResult(parsed.data);
}

export async function reorderReviewsAction(
  input: unknown,
): Promise<ActionResult<{ count: number }>> {
  const user = await requirePermission("content:manage");
  const parsed = parseInput(reorderReviewsSchema, input);
  if (!parsed.success) return parsed;

  const before = await Promise.all(
    parsed.data.items.map((item) => adminReviewRepository.findById(item.id)),
  );
  await prisma.$transaction(
    parsed.data.items.map((item) =>
      prisma.review.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      }),
    ),
  );
  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "review",
    entityId: "reorder",
    before: { items: before.map(reviewAuditSnapshot) },
    after: { items: parsed.data.items },
  });
  revalidateReviewPaths();
  return successResult({ count: parsed.data.items.length });
}
