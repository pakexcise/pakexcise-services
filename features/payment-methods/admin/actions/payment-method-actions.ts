"use server";

import { revalidatePath } from "next/cache";

import { paymentMethodAuditSnapshot } from "@/features/payment-methods/admin/lib/payment-method-snapshots";
import {
  createPaymentMethodSchema,
  paymentMethodIdSchema,
  reorderPaymentMethodsSchema,
  togglePaymentMethodSchema,
  updatePaymentMethodSchema,
} from "@/lib/validations/admin-payment-method";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import { adminPaymentMethodRepository } from "@/server/repositories/admin-payment-method-repository";
import { requirePermission } from "@/server/permissions/guards";
import { deleteStoredObject } from "@/server/storage/object-storage";

const ADMIN_PAYMENT_METHODS_PATH = "/admin/payment-methods";

function normalizeOptional(value?: string): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function revalidatePaymentMethodPaths() {
  revalidatePath(ADMIN_PAYMENT_METHODS_PATH);
  revalidatePath("/admin/applications", "layout");
}

export async function createPaymentMethodAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("payment-method:manage");
  const parsed = parseInput(createPaymentMethodSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const data = parsed.data;
  const displayOrder =
    data.displayOrder || (await adminPaymentMethodRepository.getNextDisplayOrder());

  const method = await prisma.paymentMethod.create({
    data: {
      code: data.code,
      type: data.type,
      nameEn: data.nameEn,
      nameUr: data.nameUr,
      accountTitleEn: normalizeOptional(data.accountTitleEn),
      accountTitleUr: normalizeOptional(data.accountTitleUr),
      accountNumber: normalizeOptional(data.accountNumber),
      iban: normalizeOptional(data.iban),
      bankNameEn: normalizeOptional(data.bankNameEn),
      bankNameUr: normalizeOptional(data.bankNameUr),
      instructionsEn: normalizeOptional(data.instructionsEn),
      instructionsUr: normalizeOptional(data.instructionsUr),
      isActive: data.isActive,
      displayOrder,
    },
  });

  const created = await adminPaymentMethodRepository.findById(method.id);

  await auditAdminAction({
    actorId: user.id,
    action: "CREATE",
    entityType: "payment_method",
    entityId: method.id,
    after: paymentMethodAuditSnapshot(created),
  });

  revalidatePaymentMethodPaths();
  return successResult({ id: method.id });
}

export async function updatePaymentMethodAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("payment-method:manage");
  const parsed = parseInput(updatePaymentMethodSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const data = parsed.data;
  const existing = await adminPaymentMethodRepository.findById(data.id);

  if (!existing) {
    return errorResult("Payment method not found");
  }

  const before = paymentMethodAuditSnapshot(existing);

  await prisma.paymentMethod.update({
    where: { id: data.id },
    data: {
      code: data.code,
      type: data.type,
      nameEn: data.nameEn,
      nameUr: data.nameUr,
      accountTitleEn: normalizeOptional(data.accountTitleEn),
      accountTitleUr: normalizeOptional(data.accountTitleUr),
      accountNumber: normalizeOptional(data.accountNumber),
      iban: normalizeOptional(data.iban),
      bankNameEn: normalizeOptional(data.bankNameEn),
      bankNameUr: normalizeOptional(data.bankNameUr),
      instructionsEn: normalizeOptional(data.instructionsEn),
      instructionsUr: normalizeOptional(data.instructionsUr),
      isActive: data.isActive,
      displayOrder: data.displayOrder,
    },
  });

  const updated = await adminPaymentMethodRepository.findById(data.id);

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "payment_method",
    entityId: data.id,
    before,
    after: paymentMethodAuditSnapshot(updated),
  });

  revalidatePaymentMethodPaths();
  return successResult({ id: data.id });
}

export async function deletePaymentMethodAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("payment-method:manage");
  const parsed = parseInput(paymentMethodIdSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const existing = await adminPaymentMethodRepository.findById(parsed.data.id);

  if (!existing) {
    return errorResult("Payment method not found");
  }

  const before = paymentMethodAuditSnapshot(existing);

  if (existing.qrCodeR2Key) {
    await deleteStoredObject(existing.qrCodeR2Key).catch(() => undefined);
  }

  await prisma.paymentMethod.delete({
    where: { id: parsed.data.id },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "DELETE",
    entityType: "payment_method",
    entityId: parsed.data.id,
    before,
  });

  revalidatePaymentMethodPaths();
  return successResult({ id: parsed.data.id });
}

export async function togglePaymentMethodActiveAction(
  input: unknown,
): Promise<ActionResult<{ id: string; isActive: boolean }>> {
  const user = await requirePermission("payment-method:manage");
  const parsed = parseInput(togglePaymentMethodSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const existing = await adminPaymentMethodRepository.findById(parsed.data.id);

  if (!existing) {
    return errorResult("Payment method not found");
  }

  const before = paymentMethodAuditSnapshot(existing);

  await prisma.paymentMethod.update({
    where: { id: parsed.data.id },
    data: { isActive: parsed.data.isActive },
  });

  const updated = await adminPaymentMethodRepository.findById(parsed.data.id);

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "payment_method",
    entityId: parsed.data.id,
    before,
    after: paymentMethodAuditSnapshot(updated),
  });

  revalidatePaymentMethodPaths();
  return successResult({
    id: parsed.data.id,
    isActive: parsed.data.isActive,
  });
}

export async function reorderPaymentMethodsAction(
  input: unknown,
): Promise<ActionResult<{ count: number }>> {
  const user = await requirePermission("payment-method:manage");
  const parsed = parseInput(reorderPaymentMethodsSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const beforeItems = await Promise.all(
    parsed.data.items.map((item) => adminPaymentMethodRepository.findById(item.id)),
  );

  await prisma.$transaction(
    parsed.data.items.map((item) =>
      prisma.paymentMethod.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      }),
    ),
  );

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "payment_method",
    entityId: "reorder",
    before: {
      items: beforeItems.map((method) => paymentMethodAuditSnapshot(method)),
    },
    after: {
      items: parsed.data.items,
    },
  });

  revalidatePaymentMethodPaths();
  return successResult({ count: parsed.data.items.length });
}
