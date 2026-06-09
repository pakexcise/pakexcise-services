"use server";

import { revalidatePath } from "next/cache";

import { handleContentSlugRedirect } from "@/features/cms/lib/handle-content-redirect";
import { normalizeLocalizedContent } from "@/features/cms/lib/normalize-content-input";
import { upsertGuideSeo } from "@/features/cms/lib/upsert-seo";
import {
  createGuideSchema,
  guideIdSchema,
  toggleGuideSchema,
  updateGuideSchema,
} from "@/lib/validations/admin-guide";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import { adminGuideRepository } from "@/server/repositories/admin-guide-repository";
import { requirePermission } from "@/server/permissions/guards";

const ADMIN_PATH = "/admin/guides";

function revalidateGuidePaths(slug?: string) {
  revalidatePath(ADMIN_PATH);
  revalidatePath("/guides");
  revalidatePath("/sitemap.xml");
  if (slug) {
    revalidatePath(`/guides/${slug}`);
  }
}

function guideSnapshot(guide: {
  id: string;
  slug: string;
  titleEn: string;
  isPublished: boolean;
}) {
  return {
    id: guide.id,
    slug: guide.slug,
    titleEn: guide.titleEn,
    isPublished: guide.isPublished,
  };
}

async function validateRelations(serviceIds: string[], faqIds: string[]) {
  if (serviceIds.length > 0) {
    const count = await prisma.service.count({
      where: { id: { in: serviceIds }, deletedAt: null },
    });
    if (count !== serviceIds.length) {
      return errorResult("One or more related services are invalid");
    }
  }

  if (faqIds.length > 0) {
    const count = await prisma.fAQ.count({
      where: { id: { in: faqIds }, isActive: true },
    });
    if (count !== faqIds.length) {
      return errorResult("One or more attached FAQs are invalid");
    }
  }

  return null;
}

export async function createGuideAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("content:manage");
  const parsed = parseInput(createGuideSchema, input);
  if (!parsed.success) return parsed;

  const data = parsed.data;
  const existing = await adminGuideRepository.findBySlug(data.slug);
  if (existing) {
    return errorResult("Slug already exists", { slug: ["Slug is taken"] });
  }

  const relationError = await validateRelations(
    data.relatedServiceIds,
    data.attachedFaqIds,
  );
  if (relationError) return relationError;

  const content = normalizeLocalizedContent(data);
  const publishedAt = data.isPublished ? new Date() : null;

  const guide = await prisma.guide.create({
    data: {
      slug: data.slug,
      ...content,
      relatedServiceIds: data.relatedServiceIds,
      attachedFaqIds: data.attachedFaqIds,
      isPublished: data.isPublished,
      publishedAt,
    },
  });

  await upsertGuideSeo(guide.id, guide.slug, data.seo);

  await auditAdminAction({
    actorId: user.id,
    action: "CREATE",
    entityType: "guide",
    entityId: guide.id,
    after: guideSnapshot(guide),
  });

  revalidateGuidePaths(guide.slug);
  return successResult({ id: guide.id });
}

export async function updateGuideAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("content:manage");
  const parsed = parseInput(updateGuideSchema, input);
  if (!parsed.success) return parsed;

  const data = parsed.data;
  const existing = await adminGuideRepository.findById(data.id);
  if (!existing) return errorResult("Guide not found");

  if (data.slug !== existing.slug) {
    const slugTaken = await adminGuideRepository.findBySlug(data.slug);
    if (slugTaken && slugTaken.id !== data.id) {
      return errorResult("Slug already exists", { slug: ["Slug is taken"] });
    }
  }

  const relationError = await validateRelations(
    data.relatedServiceIds,
    data.attachedFaqIds,
  );
  if (relationError) return relationError;

  const content = normalizeLocalizedContent(data);
  const publishedAt =
    data.isPublished && !existing.publishedAt
      ? new Date()
      : data.isPublished
        ? existing.publishedAt
        : null;

  const guide = await prisma.guide.update({
    where: { id: data.id },
    data: {
      slug: data.slug,
      ...content,
      relatedServiceIds: data.relatedServiceIds,
      attachedFaqIds: data.attachedFaqIds,
      isPublished: data.isPublished,
      publishedAt,
    },
  });

  if (data.slug !== existing.slug) {
    await handleContentSlugRedirect({
      prefix: "guide",
      oldSlug: existing.slug,
      newSlug: data.slug,
      actorId: user.id,
    });
  }

  await upsertGuideSeo(guide.id, guide.slug, data.seo);

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "guide",
    entityId: guide.id,
    before: guideSnapshot(existing),
    after: guideSnapshot(guide),
  });

  revalidateGuidePaths(existing.slug);
  revalidateGuidePaths(guide.slug);
  return successResult({ id: guide.id });
}

export async function toggleGuideAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("content:manage");
  const parsed = parseInput(toggleGuideSchema, input);
  if (!parsed.success) return parsed;

  const existing = await adminGuideRepository.findById(parsed.data.id);
  if (!existing) return errorResult("Guide not found");

  const guide = await prisma.guide.update({
    where: { id: parsed.data.id },
    data: {
      isPublished: parsed.data.isPublished,
      publishedAt: parsed.data.isPublished
        ? (existing.publishedAt ?? new Date())
        : null,
    },
  });

  await auditAdminAction({
    actorId: user.id,
    action: "STATUS_CHANGE",
    entityType: "guide",
    entityId: guide.id,
    before: { isPublished: existing.isPublished },
    after: { isPublished: guide.isPublished },
  });

  revalidateGuidePaths(guide.slug);
  return successResult({ id: guide.id });
}

export async function deleteGuideAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("content:manage");
  const parsed = parseInput(guideIdSchema, input);
  if (!parsed.success) return parsed;

  const existing = await adminGuideRepository.findById(parsed.data.id);
  if (!existing) return errorResult("Guide not found");

  await prisma.guide.delete({ where: { id: parsed.data.id } });

  await auditAdminAction({
    actorId: user.id,
    action: "DELETE",
    entityType: "guide",
    entityId: existing.id,
    before: guideSnapshot(existing),
  });

  revalidateGuidePaths(existing.slug);
  return successResult({ id: existing.id });
}
