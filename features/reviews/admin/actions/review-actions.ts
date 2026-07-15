"use server";

import { revalidatePath } from "next/cache";

import { reviewAuditSnapshot } from "@/features/reviews/admin/lib/review-snapshots";
import { syncGoogleBusinessReviews } from "@/features/reviews/google/sync-google-reviews";
import {
  approveReviewSchema,
  createReviewSchema,
  rejectReviewSchema,
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
import { enqueueNotificationEvent } from "@/features/notifications";

function revalidateReviewPaths(serviceSlug?: string | null) {
  revalidatePath("/admin/reviews");
  revalidatePath("/reviews");
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/regions");
  revalidatePath("/regions/[regionSlug]", "page");
  revalidatePath("/regions/[regionSlug]/[citySlug]", "page");
  revalidatePath("/about");
  if (serviceSlug) {
    revalidatePath(`/services/${serviceSlug}`);
  }
}

async function notifyReviewAuthor(input: {
  userId: string | null;
  applicationId: string | null;
  eventType: "REVIEW_APPROVED" | "REVIEW_REJECTED";
  reason?: string;
}) {
  if (!input.userId || !input.applicationId) {
    return;
  }

  const [user, application] = await Promise.all([
    prisma.user.findUnique({
      where: { id: input.userId },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        phone: true,
      },
    }),
    prisma.application.findUnique({
      where: { id: input.applicationId },
      select: {
        id: true,
        trackingId: true,
        service: { select: { nameEn: true } },
      },
    }),
  ]);

  if (!user || !application) {
    return;
  }

  await enqueueNotificationEvent({
    userId: user.id,
    applicationId: application.id,
    eventType: input.eventType,
    locale: "en",
    channels: ["IN_APP", "EMAIL"],
    recipientEmail: user.email,
    recipientPhone: user.phoneNumber ?? user.phone ?? undefined,
    payload: {
      trackingId: application.trackingId,
      serviceName: application.service.nameEn,
      reason: input.reason,
      note: input.reason,
    },
  });
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
      authorNameEn: data.authorNameEn,
      authorRoleEn: data.authorRoleEn || null,
      contentEn: data.contentEn,
      rating: data.rating,
      displayOrder,
      serviceId: data.serviceId || null,
      source: "MANUAL",
      status: data.isActive ? "APPROVED" : "PENDING",
      isActive: data.isActive,
      customerConsent: true,
      moderatedById: data.isActive ? user.id : null,
      moderatedAt: data.isActive ? new Date() : null,
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

  revalidateReviewPaths(created?.service?.slug);
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
    data: {
      authorNameEn: data.authorNameEn,
      authorRoleEn: data.authorRoleEn || null,
      contentEn: data.contentEn,
      rating: data.rating,
      displayOrder: data.displayOrder,
      serviceId: data.serviceId || null,
      isActive: existing.status === "APPROVED" ? data.isActive : false,
    },
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

  revalidateReviewPaths(updated?.service?.slug ?? existing.service?.slug);
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

  revalidateReviewPaths(existing.service?.slug);
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

  if (parsed.data.isActive && existing.status !== "APPROVED") {
    return errorResult("Approve the review before publishing it.");
  }

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

  revalidateReviewPaths(existing.service?.slug);
  return successResult(parsed.data);
}

export async function approveReviewAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("content:manage");
  const parsed = parseInput(approveReviewSchema, input);
  if (!parsed.success) return parsed;

  const existing = await adminReviewRepository.findById(parsed.data.id);
  if (!existing) return errorResult("Review not found");

  await prisma.review.update({
    where: { id: parsed.data.id },
    data: {
      status: "APPROVED",
      isActive: true,
      moderationNote: null,
      moderatedById: user.id,
      moderatedAt: new Date(),
    },
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

  await notifyReviewAuthor({
    userId: existing.userId,
    applicationId: existing.applicationId,
    eventType: "REVIEW_APPROVED",
  });

  revalidateReviewPaths(existing.service?.slug);
  return successResult({ id: parsed.data.id });
}

export async function rejectReviewAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("content:manage");
  const parsed = parseInput(rejectReviewSchema, input);
  if (!parsed.success) return parsed;

  const existing = await adminReviewRepository.findById(parsed.data.id);
  if (!existing) return errorResult("Review not found");

  await prisma.review.update({
    where: { id: parsed.data.id },
    data: {
      status: "REJECTED",
      isActive: false,
      moderationNote: parsed.data.moderationNote,
      moderatedById: user.id,
      moderatedAt: new Date(),
    },
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

  await notifyReviewAuthor({
    userId: existing.userId,
    applicationId: existing.applicationId,
    eventType: "REVIEW_REJECTED",
    reason: parsed.data.moderationNote,
  });

  revalidateReviewPaths(existing.service?.slug);
  return successResult({ id: parsed.data.id });
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

export async function syncGoogleReviewsAction(): Promise<
  ActionResult<{ imported: number; updated: number; skipped: number }>
> {
  const user = await requirePermission("content:manage");

  try {
    const result = await syncGoogleBusinessReviews({ actorId: user.id });
    await auditAdminAction({
      actorId: user.id,
      action: "UPDATE",
      entityType: "review",
      entityId: "google-sync",
      after: result,
    });
    revalidateReviewPaths();
    return successResult(result);
  } catch (error) {
    return errorResult(
      error instanceof Error ? error.message : "Google sync failed.",
    );
  }
}
