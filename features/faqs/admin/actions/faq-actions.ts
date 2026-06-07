"use server";

import { revalidatePath } from "next/cache";

import { faqAuditSnapshot } from "@/features/faqs/admin/lib/faq-snapshots";
import {
  createFaqSchema,
  faqIdSchema,
  reorderFaqsSchema,
  toggleFaqSchema,
  updateFaqSchema,
} from "@/lib/validations/admin-faq";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { sanitizeFaqAnswer } from "@/lib/security/sanitize-content";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import { adminFaqRepository } from "@/server/repositories/admin-faq-repository";
import { requirePermission } from "@/server/permissions/guards";

const ADMIN_FAQS_PATH = "/admin/faqs";

function revalidateFaqPaths(serviceSlug?: string | null) {
  revalidatePath(ADMIN_FAQS_PATH);
  revalidatePath("/faqs");

  if (serviceSlug) {
    revalidatePath(`/services/${serviceSlug}`);
  }
}

function normalizeFaqInput(
  data: Awaited<ReturnType<typeof createFaqSchema.parse>>,
) {
  return {
    questionEn: data.questionEn,
    questionUr: data.questionUr,
    answerEn: sanitizeFaqAnswer(data.answerEn),
    answerUr: sanitizeFaqAnswer(data.answerUr),
    category: data.category,
    serviceId: data.serviceId || null,
    isActive: data.isActive,
    displayOrder: data.displayOrder,
  };
}

export async function createFaqAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("faq:manage");
  const parsed = parseInput(createFaqSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const data = parsed.data;

  if (data.serviceId) {
    const service = await prisma.service.findFirst({
      where: { id: data.serviceId, deletedAt: null },
      select: { id: true },
    });

    if (!service) {
      return errorResult("Service not found", {
        serviceId: ["Invalid service"],
      });
    }
  }

  const displayOrder =
    data.displayOrder ||
    (await adminFaqRepository.getNextDisplayOrder(data.serviceId));

  const faq = await prisma.fAQ.create({
    data: {
      ...normalizeFaqInput(data),
      displayOrder,
    },
  });

  const created = await adminFaqRepository.findById(faq.id);

  await auditAdminAction({
    actorId: user.id,
    action: "CREATE",
    entityType: "faq",
    entityId: faq.id,
    after: faqAuditSnapshot(created),
  });

  revalidateFaqPaths(created?.service?.slug);
  return successResult({ id: faq.id });
}

export async function updateFaqAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("faq:manage");
  const parsed = parseInput(updateFaqSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const data = parsed.data;
  const existing = await adminFaqRepository.findById(data.id);

  if (!existing) {
    return errorResult("FAQ not found");
  }

  if (data.serviceId) {
    const service = await prisma.service.findFirst({
      where: { id: data.serviceId, deletedAt: null },
      select: { id: true },
    });

    if (!service) {
      return errorResult("Service not found", {
        serviceId: ["Invalid service"],
      });
    }
  }

  const before = faqAuditSnapshot(existing);

  await prisma.fAQ.update({
    where: { id: data.id },
    data: normalizeFaqInput(data),
  });

  const updated = await adminFaqRepository.findById(data.id);

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "faq",
    entityId: data.id,
    before,
    after: faqAuditSnapshot(updated),
  });

  revalidateFaqPaths(existing.service?.slug);
  revalidateFaqPaths(updated?.service?.slug);
  return successResult({ id: data.id });
}

export async function deleteFaqAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("faq:manage");
  const parsed = parseInput(faqIdSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const existing = await adminFaqRepository.findById(parsed.data.id);

  if (!existing) {
    return errorResult("FAQ not found");
  }

  const before = faqAuditSnapshot(existing);

  await prisma.fAQ.delete({
    where: { id: parsed.data.id },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "DELETE",
    entityType: "faq",
    entityId: parsed.data.id,
    before,
  });

  revalidateFaqPaths(existing.service?.slug);
  return successResult({ id: parsed.data.id });
}

export async function toggleFaqActiveAction(
  input: unknown,
): Promise<ActionResult<{ id: string; isActive: boolean }>> {
  const user = await requirePermission("faq:manage");
  const parsed = parseInput(toggleFaqSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const existing = await adminFaqRepository.findById(parsed.data.id);

  if (!existing) {
    return errorResult("FAQ not found");
  }

  const before = faqAuditSnapshot(existing);

  await prisma.fAQ.update({
    where: { id: parsed.data.id },
    data: { isActive: parsed.data.isActive },
  });

  const updated = await adminFaqRepository.findById(parsed.data.id);

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "faq",
    entityId: parsed.data.id,
    before,
    after: faqAuditSnapshot(updated),
  });

  revalidateFaqPaths(existing.service?.slug);
  return successResult({
    id: parsed.data.id,
    isActive: parsed.data.isActive,
  });
}

export async function reorderFaqsAction(
  input: unknown,
): Promise<ActionResult<{ count: number }>> {
  const user = await requirePermission("faq:manage");
  const parsed = parseInput(reorderFaqsSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const beforeItems = await Promise.all(
    parsed.data.items.map((item) => adminFaqRepository.findById(item.id)),
  );

  await prisma.$transaction(
    parsed.data.items.map((item) =>
      prisma.fAQ.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      }),
    ),
  );

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "faq",
    entityId: "reorder",
    before: {
      items: beforeItems.map((faq) => faqAuditSnapshot(faq)),
    },
    after: {
      items: parsed.data.items,
    },
  });

  revalidateFaqPaths();
  return successResult({ count: parsed.data.items.length });
}
