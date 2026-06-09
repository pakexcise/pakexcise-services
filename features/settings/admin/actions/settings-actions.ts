"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import {
  businessSettingsSnapshot,
  featureFlagSettingsSnapshot,
  paymentSettingsSnapshot,
  seoSettingsSnapshot,
  trackingSettingsSnapshot,
} from "@/features/settings/admin/lib/snapshots";
import { PUBLIC_SETTINGS_CACHE_TAG } from "@/features/settings/lib/keys";
import { loadAdminSettingsSnapshot, saveSettingsGroup } from "@/server/repositories/admin-settings-repository";
import {
  updateBusinessSettingsSchema,
  updateFeatureFlagSettingsSchema,
  updatePaymentSettingsSchema,
  updateSeoSettingsSchema,
  updateTrackingSettingsSchema,
} from "@/lib/validations/admin-settings";
import {
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { requirePermission } from "@/server/permissions/guards";

const ADMIN_SETTINGS_PATH = "/admin/settings";

function revalidateAfterSettingsUpdate() {
  revalidateTag(PUBLIC_SETTINGS_CACHE_TAG);
  revalidatePath(ADMIN_SETTINGS_PATH);
  revalidatePath("/", "layout");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/blog");
  revalidatePath("/guides");
  revalidatePath("/sitemap.xml");
}

export async function updateBusinessSettingsAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  const user = await requirePermission("settings:manage");
  const parsed = parseInput(updateBusinessSettingsSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const before = await loadAdminSettingsSnapshot();

  await saveSettingsGroup("business", parsed.data);

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "settings",
    entityId: "business",
    before: businessSettingsSnapshot(before.business),
    after: businessSettingsSnapshot(parsed.data),
  });

  revalidateAfterSettingsUpdate();
  return successResult({ ok: true });
}

export async function updatePaymentSettingsAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  const user = await requirePermission("settings:manage");
  const parsed = parseInput(updatePaymentSettingsSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const before = await loadAdminSettingsSnapshot();

  await saveSettingsGroup("payment", parsed.data);

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "settings",
    entityId: "payment",
    before: paymentSettingsSnapshot(before.payment),
    after: paymentSettingsSnapshot(parsed.data),
  });

  revalidateAfterSettingsUpdate();
  return successResult({ ok: true });
}

export async function updateSeoSettingsAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  const user = await requirePermission("settings:manage");
  const parsed = parseInput(updateSeoSettingsSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const before = await loadAdminSettingsSnapshot();

  await saveSettingsGroup("seo", parsed.data);

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "settings",
    entityId: "seo",
    before: seoSettingsSnapshot(before.seo),
    after: seoSettingsSnapshot(parsed.data),
  });

  revalidateAfterSettingsUpdate();
  return successResult({ ok: true });
}

export async function updateTrackingSettingsAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  const user = await requirePermission("settings:manage");
  const parsed = parseInput(updateTrackingSettingsSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const before = await loadAdminSettingsSnapshot();

  await saveSettingsGroup("tracking", parsed.data);

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "settings",
    entityId: "tracking",
    before: trackingSettingsSnapshot(before.tracking),
    after: trackingSettingsSnapshot(parsed.data),
  });

  revalidateAfterSettingsUpdate();
  return successResult({ ok: true });
}

export async function updateFeatureFlagSettingsAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  const user = await requirePermission("settings:manage");
  const parsed = parseInput(updateFeatureFlagSettingsSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const before = await loadAdminSettingsSnapshot();

  await saveSettingsGroup("features", parsed.data);

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "settings",
    entityId: "features",
    before: featureFlagSettingsSnapshot(before.features),
    after: featureFlagSettingsSnapshot(parsed.data),
  });

  revalidateAfterSettingsUpdate();
  return successResult({ ok: true });
}
