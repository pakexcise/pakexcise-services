"use server";

import { revalidatePath } from "next/cache";

import { socialLinkAuditSnapshot } from "@/features/social/admin/lib/social-snapshots";
import {
  createSocialLinkSchema,
  reorderSocialLinksSchema,
  socialLinkIdSchema,
  toggleSocialLinkSchema,
  updateSocialLinkSchema,
} from "@/lib/validations/admin-social";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import { adminSocialRepository } from "@/server/repositories/admin-social-repository";
import { requirePermission } from "@/server/permissions/guards";

const ADMIN_SOCIAL_PATH = "/admin/social";

function revalidateSocialPaths() {
  revalidatePath(ADMIN_SOCIAL_PATH);
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/", "layout");
}

export async function createSocialLinkAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("social:manage");
  const parsed = parseInput(createSocialLinkSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const data = parsed.data;
  const displayOrder =
    data.displayOrder || (await adminSocialRepository.getNextDisplayOrder());

  const link = await prisma.socialLink.create({
    data: {
      platform: data.platform,
      url: data.url,
      iconName: data.iconName,
      labelEn: data.labelEn,
      labelUr: data.labelUr,
      isActive: data.isActive,
      displayOrder,
    },
  });

  const created = await adminSocialRepository.findById(link.id);

  await auditAdminAction({
    actorId: user.id,
    action: "CREATE",
    entityType: "social_link",
    entityId: link.id,
    after: socialLinkAuditSnapshot(created),
  });

  revalidateSocialPaths();
  return successResult({ id: link.id });
}

export async function updateSocialLinkAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("social:manage");
  const parsed = parseInput(updateSocialLinkSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const data = parsed.data;
  const existing = await adminSocialRepository.findById(data.id);

  if (!existing) {
    return errorResult("Social link not found");
  }

  const before = socialLinkAuditSnapshot(existing);

  await prisma.socialLink.update({
    where: { id: data.id },
    data: {
      platform: data.platform,
      url: data.url,
      iconName: data.iconName,
      labelEn: data.labelEn,
      labelUr: data.labelUr,
      isActive: data.isActive,
      displayOrder: data.displayOrder,
    },
  });

  const updated = await adminSocialRepository.findById(data.id);

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "social_link",
    entityId: data.id,
    before,
    after: socialLinkAuditSnapshot(updated),
  });

  revalidateSocialPaths();
  return successResult({ id: data.id });
}

export async function deleteSocialLinkAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("social:manage");
  const parsed = parseInput(socialLinkIdSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const existing = await adminSocialRepository.findById(parsed.data.id);

  if (!existing) {
    return errorResult("Social link not found");
  }

  const before = socialLinkAuditSnapshot(existing);

  await prisma.socialLink.delete({
    where: { id: parsed.data.id },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "DELETE",
    entityType: "social_link",
    entityId: parsed.data.id,
    before,
  });

  revalidateSocialPaths();
  return successResult({ id: parsed.data.id });
}

export async function toggleSocialLinkActiveAction(
  input: unknown,
): Promise<ActionResult<{ id: string; isActive: boolean }>> {
  const user = await requirePermission("social:manage");
  const parsed = parseInput(toggleSocialLinkSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const existing = await adminSocialRepository.findById(parsed.data.id);

  if (!existing) {
    return errorResult("Social link not found");
  }

  const before = socialLinkAuditSnapshot(existing);

  await prisma.socialLink.update({
    where: { id: parsed.data.id },
    data: { isActive: parsed.data.isActive },
  });

  const updated = await adminSocialRepository.findById(parsed.data.id);

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "social_link",
    entityId: parsed.data.id,
    before,
    after: socialLinkAuditSnapshot(updated),
  });

  revalidateSocialPaths();
  return successResult({
    id: parsed.data.id,
    isActive: parsed.data.isActive,
  });
}

export async function reorderSocialLinksAction(
  input: unknown,
): Promise<ActionResult<{ count: number }>> {
  const user = await requirePermission("social:manage");
  const parsed = parseInput(reorderSocialLinksSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const beforeItems = await Promise.all(
    parsed.data.items.map((item) => adminSocialRepository.findById(item.id)),
  );

  await prisma.$transaction(
    parsed.data.items.map((item) =>
      prisma.socialLink.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      }),
    ),
  );

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "social_link",
    entityId: "reorder",
    before: {
      items: beforeItems.map((link) => socialLinkAuditSnapshot(link)),
    },
    after: {
      items: parsed.data.items,
    },
  });

  revalidateSocialPaths();
  return successResult({ count: parsed.data.items.length });
}
